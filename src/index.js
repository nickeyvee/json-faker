import React from 'react';
import { render } from 'react-dom';

import set from 'lodash.set'
import get from 'lodash.get'
import times from 'lodash.times'

import { makeStyles } from '@material-ui/core/styles';
// import { withStyles } from '@material-ui/core/styles';

import { TextField, Button } from '@material-ui/core';
// import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

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

import Editor from './components/Editor';
import Preview from './components/Preview'

import DataProvider from './components/DataProvider'

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

export function App(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    name: 'React',
    value: [],
    result: [],
    schema: null,
    schemas: [],
    templates: [],
    button: {
      margin: '0 8px 0 8px'
    },
    root: {
      flexGrow: 1,
      height: '100%',
      margin: '0'
    },
    items: [],
    repeat: 1
  });

  const onChange = (v) => {
    const re = /\{\{((?!\}\})(.|\n))*\}\}/g

    const options = {
      objects: {
        postProcessFnc: (schema, obj, defaultFnc) => {

          Object.keys(obj).forEach((key) => {
            const a = get(obj, key)
            const b = typeof a === 'string' ? a.match(re) : null

            if (b && b[0] && b[0]) {
              const c = b[0].slice(2, -2)

              set(schema, ['properties', key, 'faker'], c)
            }
            // Pass template variable in here ^^^^^^^^^^^^
            // console.log(schema.properties[key])
          })

          return ({
            ...defaultFnc(schema, obj),
            required: Object.getOwnPropertyNames(obj)
          })
        }
      }
    };

    try {
      const schema = inferSchema(v, options)
          // console.log(schema)
      setState({ ...state, schema })
    } catch (e) {
      console.log(e)
    }
  }

  const onInput = ({ currentTarget: { value } }) => {
    setState({ ...state, repeat: value ? parseInt(value) : 1 })
  }

  const generate = async () => {
    const { schema, repeat, items } = state

    await setState({ ...state, items: times(repeat, () => jsf.generate(schema)) })
  }

  const toggleDrawer = (side, open) => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState({ ...state, [side]: open });
  };

  const sideList = (side) => {
    return (
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
    )};

  const logout = () => (
    <Button
     variant="outlined"
     href="/auth/logout"
     className="auth-btn"
   >
     Logout
   </Button>
  )

  const login = () => (
    <Button
      style={state.button}
      href="/auth/github"
      className="auth-btn"
      variant="outlined"
    >
      Login with Github
    </Button>
  )

  console.log(props)

  return (
    <div style={{ height: '100%' }}>
      <Drawer open={state.left} onClose={toggleDrawer('left', false)}>
        {sideList('left')}
      </Drawer>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Grid container spacing={1} justify="space-between">
            <Grid item xs={10} sm={5}>
              <Button
                style={state.button}
                onClick={toggleDrawer('left', true)}
              >Open Left</Button>
              <Button
                style={state.button}
                onClick={generate}
              >Generate</Button>
              <TextField
                onChange={onInput}
                variant="outlined"
                size="small"
              />
            </Grid>
            {props.user ? logout() : login()}
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6} style={{ height: '89vh' }}>
          <Paper>
            <Editor
              onChange={onChange}
              viewPortMargin={Infinity}
              readOnly={false}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} style={{ height: '89vh' }}>
          <Paper style={state.root}>
            <Preview defaultValue={state.items}/>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

const Wrapped = new DataProvider(App);

render(<Wrapped />, document.getElementById('root'));
