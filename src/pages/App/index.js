import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { logout } from "../../services/auth";
import Dimensions from "react-dimensions";
import { Container, ButtonContainer, PointReference } from "./styles";
import MapGL from "react-map-gl";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import api from "../../services/api";

import Properties from "./components/Properties";
import Button from "./components/Button";

const TOKEN =
  "pk.eyJ1IjoibnlkaW5vIiwiYSI6ImNrMzV3NHdyMjFoc3Mzbm1vbGNuY2s4aWQifQ.Z4crc5NFQXEoOOdorcDSJw";

class Map extends Component {
    constructor() {
        super();
        this.updatePropertiesLocalization = debounce(
          this.updatePropertiesLocalization,
          500
        );
      }
  static propTypes = {
    containerWidth: PropTypes.number.isRequired,
    containerHeight: PropTypes.number.isRequired
  };

  state = {
    viewport: {
      latitude: -27.2108001,
      longitude: -49.6446024,
      zoom: 12.8,
      bearing: 0,
      pitch: 0,
    },
    properties: [],
    addActivate: false
  };

  componentDidMount() {
    this.loadProperties();
  }
  
  updatePropertiesLocalization() {
    this.loadProperties();
  }
  
  loadProperties = async () => {
    const { latitude, longitude } = this.state.viewport;
    try {
      const response = await api.get("/properties", {
        params: { latitude, longitude }
      });
      console.log(response);
      this.setState({ properties: response.data });
    } catch (err) {
      console.log(err);
    }
  };

  handleLogout = e => {
    logout();
    this.props.history.push("/");
  };

  renderActions() {
    return (
      <ButtonContainer>
        <Button color="#222" onClick={this.handleLogout}>
          <i className="fa fa-times" />
        </Button>
      </ButtonContainer>
    );
  }

  renderActions() {
    return (
      <ButtonContainer>
        <Button
          color="#fc6963"
          onClick={() => this.setState({ addActivate: true })}
        >
          <i className="fa fa-plus" />
        </Button>
        <Button color="#222" onClick={this.handleLogout}>
          <i className="fa fa-times" />
        </Button>
      </ButtonContainer>
    );
  }

  renderButtonAdd() {
    return (
      this.state.addActivate && (
        <PointReference>
          <i className="fa fa-map-marker" />
          <div>
            <button onClick={this.handleAddProperty} type="button">
              Adicionar
            </button>
            <button
              onClick={() => this.setState({ addActivate: false })}
              className="cancel"
            >
              Cancelar
            </button>
          </div>
        </PointReference>
      )
    );
  }

  handleAddProperty = () => {
    const { match, history } = this.props;
    const { latitude, longitude } = this.state.viewport;
    history.push(
      `${match.url}/properties/add?latitude=${latitude}&longitude=${longitude}`
    );
    
    this.setState({ addActivate: false });
  };

  render() {
    const { containerWidth: width, containerHeight: height, match } = this.props;
    const { properties, addActivate } = this.state;
    return (
        <Fragment>
            <MapGL
                width={width}
                height={height}
                {...this.state.viewport}
                mapStyle="mapbox://styles/mapbox/dark-v9"
                mapboxApiAccessToken={TOKEN}
                onViewportChange={viewport => this.setState({ viewport })}
                onViewStateChange={this.updatePropertiesLocalization.bind(this)}
            >
                {!addActivate && <Properties match={match} properties={properties} />}
            </MapGL>
            {this.renderActions()}
            {this.renderButtonAdd() /* Esse aqui será adicionado */}
        </Fragment>
    );
  }
}

const DimensionedMap = withRouter(Dimensions()(Map));
const App = () => (
  <Container>
    <DimensionedMap />
  </Container>
);

export default App;