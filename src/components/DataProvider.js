import React from 'react';

import http from '../api/baseHttp.js'
import auth from '../api/auth.js'

const options = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
}

export default function DataProvider(Presenter) {
  return class extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        templates: [],
        user: null
      }
    }

    async componentDidMount() {
      if (localStorage.getItem('drawer')) {
        this.setState({ open: localStorage.getItem('drawer') === 'true' })
      }

      http.get('/').then(({ data }) => {
        console.log(data);
        this.setState({ templates: data });
      });

      const { status, data } = await auth.get('/current_user', options)

      if (status === 200 && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        this.setState({ user: data.user })
      }
    }

    render () {
      return (
        <Presenter
          templates={this.state.templates}
          user={this.state.user}
          {...this.props}
        />
      )
    }
  }
}
