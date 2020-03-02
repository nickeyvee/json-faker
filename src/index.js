import React, { Component } from 'react';
import { render } from 'react-dom';

import { makeStyles } from '@material-ui/core/styles';
// import { withStyles } from '@material-ui/core/styles';

import { TextField, Button } from '@material-ui/core';
// import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

import inferSchema from 'to-json-schema';

import jsf from 'json-schema-faker';

import times from 'lodash.times'

import Editor from './Editor';
import Preview from './Preview'

import './style.css';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});

jsf.extend('faker', () => require('faker'));

export default function App() {
  const classes = useStyles();
  const [state, setState] = React.useState({
    name: 'React',
    value: [],
    result: [],
    schema: null,
    root: {
      flexGrow: 1,
      height: '100%',
      margin: '0'
    },
    items: [],
    input: 1
  });

  const onChange = (input) => {
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
    setState({ ...state, input, schema })
  }

  const onInput = ({ currentTarget: { value } }) => {
    console.log(value)
    setState({ ...state, input: value ? parseInt(value) : 1 })
  }

  const generate = async () => {
    const { schema, input, items } = state

    await setState({ ...state, items: times(input, () => jsf.generate(schema)) })
  }

  const toggleDrawer = (side, open) => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [side]: open });
  };

  const sideList = side => (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(side, false)}
      onKeyDown={toggleDrawer(side, false)}
    >
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <div style={{ height: '100%' }}>
      <Drawer open={state.left} onClose={toggleDrawer('left', false)}>
        {sideList('left')}
      </Drawer>
      <Grid
        container
        spacing={1}
      >
        <Grid
          item
          xs={12}
        >
          <Button
            onClick={toggleDrawer('left', true)}
          >Open Left</Button>
          <Button
           onClick={generate}
          >Generate</Button>
          <TextField
            onChange={onInput}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          style={{ height: '89vh' }}
        >
          <Paper>
            <Editor
              onChange={onChange}
              viewPortMargin={Infinity}
              readOnly={false}           
            />
          </Paper>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          style={{ height: '89vh' }}
        >
          <Paper style={state.root}>
            <Preview
              defaultValue={state.items}
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

render(<App />, document.getElementById('root'));
