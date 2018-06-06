import * as _ from 'lodash-es';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { plot, Plots } from 'plotly.js/lib/core';

import { coFetchJSON } from '../../co-fetch';
import { SafetyFirst } from '../safety-first';

import { prometheusBasePath } from './index';
import {FLAGS} from '../../features';

export class BaseGraph extends SafetyFirst {
  constructor(props) {
    super(props);
    // eslint-disable-next-line no-console
    console.log(this.props);

    this.interval = null;
    this.setNode = n => this.setNode_(n);
    // Child classes set these
    this.data = [];
    this.resize = () => this.node && Plots.resize(this.node);
    this.timeSpan = this.props.timeSpan || 60 * 60 * 1000; // 1 hour
    this.state = {
      error: null,
    };
    this.start = null;
    this.end = null;
  }

  setNode_(node) {
    if (node) {
      this.node = node;
    }
  }

  fetch () {
    const timeSpan = this.end - this.start || this.timeSpan;
    const pollInterval = timeSpan / 120 || 15000;

    if (!this.props.flags[FLAGS.PROMETHEUS]) {
      return;
    }

    let queries = this.props.query;
    if (!_.isArray(queries)) {
      queries = [{
        query: queries,
      }];
    }

    const end = this.end || Date.now();
    const start = this.start || (end - timeSpan);
    const basePath = this.props.basePath || prometheusBasePath;
    const stepSize = pollInterval / 1000;
    const promises = queries.map(q => {
      const url = this.timeSpan
        ? `${basePath}/api/v1/query_range?query=${encodeURIComponent(q.query)}&start=${start / 1000}&end=${end / 1000}&step=${stepSize}`
        : `${basePath}/api/v1/query?query=${encodeURIComponent(q.query)}`;
      return coFetchJSON(url);
    });
    Promise.all(promises)
      .then(data => {
        try {
          this.updateGraph(data);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      })
      .catch(error => {
        this.setState({error});
        this.updateGraph(null, error);
      })
      .then(() => this.interval = setTimeout(() => {
        this.fetch();
      }, pollInterval));
  }

  componentWillUnmount () {
    super.componentWillUnmount();
    window.removeEventListener('resize', this.resize);
    clearInterval(this.interval);
  }

  componentDidMount () {
    super.componentDidMount();

    this.fetch();
    window.addEventListener('resize', this.resize);

    if (!this.node) {
      return;
    }

    this.layout = _.extend({
      height: 150,
      autosize: true,
    }, this.layout);

    plot(this.node, this.data, this.layout, this.options).catch(e => {
      // eslint-disable-next-line no-console
      console.error('error initializing graph:', e);
    });
  }

  componentDidUpdate(prevProps){
    if (prevProps.flags[FLAGS.PROMETHEUS] !== this.props.flags[FLAGS.PROMETHEUS]) {
      this.fetch();
    }
  }

  prometheusURL () {
    let queries = this.props.query;
    if (!_.isArray(queries)) {
      queries = [{
        query: queries,
      }];
    }
    const params = new URLSearchParams();
    _.each(queries, (q, i) => {
      params.set(`g${i}.range_input`, '1h');
      params.set(`g${i}.expr`, q.query);
      params.set(`g${i}.tab`, '0');
    });

    return `/prometheus/graph?${params.toString()}`;
  }

  render () {
    if (!this.props.flags[FLAGS.PROMETHEUS]){
      return <div />;
    }
    return <a href={this.prometheusURL()} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
      <div className="graph-wrapper" style={this.style}>
        <h5 className="graph-title">{this.props.title}</h5>
        <div ref={this.setNode} style={{width: '100%'}}/>
      </div>
    </a>;
  }
}

BaseGraph.propTypes = {
  query: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        query: PropTypes.string,
      })),
  ]).isRequired,
  title: PropTypes.string.isRequired,
  timeSpan: PropTypes.number,
  basePath: PropTypes.string,
};
