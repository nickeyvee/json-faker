import React, { Component } from 'react';
import { render } from 'react-dom';

import inferSchema from 'to-json-schema';

import jsf from 'json-schema-faker';

import times from 'lodash.times'

import Editor from './Editor';
import './style.css';

jsf.extend('faker', () => require('faker'));

class App extends Component {
  constructor() {
    super();
    this.state = {
      name: 'React',
      value: [],
      schema: null,
      items: [],
      input: 1
    };
  }

  onChange = (input) => {
    const postProcessFnc = (type, schema, value, defaultFunc) =>  {
      return (type === 'integer') ? {...schema, required: true} : defaultFunc(type, schema, value)
    }

    const options = {
      // postProcessFnc,
      objects: {
        postProcessFnc: (schema, obj, defaultFnc) => ({
          ...defaultFnc(schema, obj), required: Object.getOwnPropertyNames(obj)
        })
      }
    };

    const schema = inferSchema(input, options)
    console.log(schema)
    this.setState({ input, schema })
  }

  onInput = ({ currentTarget: { value } }) => {
    this.setState({ input: value ? parseInt(value) : 1 })
  }

  generate = async () => {
    const { schema, input, items } = this.state

    await this.setState({ items: times(input, () => jsf.generate(schema)) })

    console.log(items)
  }

  render() {
    return (
      <div className="editor-wrapper">
        <button onClick={this.generate}>Generate</button>
        <input
          type="number"
          onChange={this.onInput}
        />
        <div className="flex-container">
          <div className="flex-item">
            <Editor
              onChange={this.onChange}
              viewPortMargin={Infinity}
              readOnly={false}           
            />
          </div>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
