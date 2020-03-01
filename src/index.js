import React, { Component } from 'react';
import { render } from 'react-dom';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import inferSchema from 'to-json-schema';

import jsf from 'json-schema-faker';

import times from 'lodash.times'

import Editor from './Editor';
import Preview from './Preview'

import './style.css';

jsf.extend('faker', () => require('faker'));

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    height: '100%',
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

class App extends Component {
  constructor() {
    super();
    this.classes = useStyles
    this.state = {
      name: 'React',
      value: [],
      result: [],
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
      <div className={this.classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={this.classes.paper}>
              <Editor
                onChange={this.onChange}
                viewPortMargin={Infinity}
                readOnly={false}           
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper className={this.classes.paper}>
              <Preview
                defaultValue={this.state.value}
              />
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
