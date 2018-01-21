import React from 'react';
import { connect } from 'dva';
import queryString from 'querystring';

class PlanetInfo extends React.PureComponent {
  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
    const { location, dispatch } = this.props;
    let planetNo = null;
    if (location.search) {
      const params = queryString.parse(location.search.substr(1));
      if (params && params.planetNo) {
        planetNo = params.planetNo;
        dispatch({
          type: 'planet/fetchOne',
          payload: {
            planetNo,
          }
        });
      }
    }
  }

  render() {
    return (
      <div style={{background: '#fff', padding: 24, minHeight: 380}}><h1>星星详细信息...</h1></div>
    );
  }
}

export default connect(state => {
  return {
    user: state.user,
    planet: state.planet.planet
  };
})(PlanetInfo);
