import React, { Component } from 'react';
import R from 'ramda';
import { Grid, Row, Col, PageHeader, Button, Collapse, Checkbox, Table } from 'react-bootstrap';
import NumberFormat from 'react-number-format';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

function TextCell(props) {
  return (
    <td className="text-left">
      {props.text}
    </td>
  );
}

function RightCell(props) {
  return (
    <td className="text-right">
      {props.children}
    </td>
  );
}

function FormattedNumber(props) {
  return (
    <NumberFormat value={props.number}
                  displayType={'text'}
                  thousandSeparator={true} />
  );
}

function NumberCell(props) {
  return (
    <RightCell>
      <FormattedNumber number={props.number} />
    </RightCell>
  );
}

function CrewAndBunks(props) {
  if (props.crew > 0) {
    return (
      <RightCell>
        <FormattedNumber number={props.crew} />
        {' / '}
        <FormattedNumber number={props.bunks} />
      </RightCell>
    );
  } else {
    return (<RightCell></RightCell>);
  }
}

class App extends Component {
  // TODO: compute this from this.state.data on the fly
  races = [
    'human',
    'hai',
    'quarg',
    'korath',
    'wanderer',
    'coalition',
    'pug'
  ];

  categories = [
    'Transport',
    'Light Freighter',
    'Heavy Freighter',
    'Interceptor',
    'Light Warship',
    'Medium Warship',
    'Heavy Warship',
    'Fighter',
    'Drone'
  ];

  licenses = {
    'Navy':               'human',
    'Carrier':            'human',
    'Cruiser':            'human',
    'Militia Carrier':    'human',
    'Unfettered Militia': 'hai',
    'Wanderer':           'wanderer',
    'Wanderer Military':  'wanderer',
    'Coalition':          'coalition',
    'Heliarch':           'coalition'
  };

  state = {
    isLoading: true,
    data: {},
    filtersCollapsed: true,
    ordering: { columnName: null },
    raceFilter: this.races.reduce(
      (races, race) => R.merge(races, { [race]: true }),
      {}
    ),
    categoryFilter: this.categories.reduce(
      (categories, category) => R.merge(categories, { [category]: true }),
      {}
    ),
    licenseFilter: Object.keys(this.licenses).reduce(
      (licenses, license) => R.merge(licenses, { [license]: true }),
      {}
    )
  }

  componentDidMount() {
    fetch('data.json').then(response => {
      return response.json();
    }).then(data => {
      this.setState({ isLoading: false, data: data });
    });
  }

  toggleFiltersVisibility = () => {
    this.setState({ filtersCollapsed: !this.state.filtersCollapsed })
  };

  toggleRaceFiltering = (race) => {
    this.setState({
      raceFilter: R.merge(
        this.state.raceFilter,
        { [race]: !this.state.raceFilter[race] }
      )
    })
  };

  toggleCategoryFiltering = (category) => {
    this.setState({
      categoryFilter: R.merge(
        this.state.categoryFilter,
        { [category]: !this.state.categoryFilter[category] }
      )
    })
  }

  toggleLicenseFiltering = (license) => {
    this.setState({
      licenseFilter: R.merge(
        this.state.licenseFilter,
        { [license]: !this.state.licenseFilter[license] }
      )
    })
  }

  toggleOrdering = (columnName) => {
    if (this.state.ordering.columnName === columnName) {
      if (this.state.ordering.order === 'asc') {
        this.setState({ ordering: { columnName: null } });
      } else {
        this.setState({ ordering: { columnName: columnName, order: 'asc' } });
      }
    } else {
      this.setState({ ordering: { columnName: columnName, order: 'desc' } });
    }
  }

  capitalize([first, ...rest]) {
    return first.toUpperCase() + rest.join('').toLowerCase();
  }

  renderFilters() {
    const raceCheckboxes = this.races.map(race => (
      <Checkbox key={race}
                checked={this.state.raceFilter[race]}
                onChange={() => this.toggleRaceFiltering(race)}>
        {this.capitalize(race)}
      </Checkbox>
    ));

    const categoryCheckboxes = this.categories.map(category => (
      <Checkbox key={category}
                checked={this.state.categoryFilter[category]}
                onChange={() => this.toggleCategoryFiltering(category)}>
        {category}
      </Checkbox>
    ));

    const licenseCheckboxes = Object.keys(this.licenses).map(license => (
      <Checkbox key={license}
                checked={this.state.licenseFilter[license]}
                onChange={() => this.toggleLicenseFiltering(license)}>
        {license}
      </Checkbox>
    ));

    let collapseIcon;
    if (this.state.filtersCollapsed) {
      collapseIcon = <span className="glyphicon glyphicon-menu-down" />;
    } else {
      collapseIcon = <span className="glyphicon glyphicon-menu-up" />;
    }

    return (
      <div className="filters-group">
        <Collapse in={!this.state.filtersCollapsed}>
          <Grid fluid={true}>
            <Row>
              <Col lg={1}>
                <strong>Race</strong>
                {raceCheckboxes}
              </Col>
              <Col lg={1}>
                <strong>Category</strong>
                {categoryCheckboxes}
              </Col>
              <Col lg={2}>
                <strong>License</strong>
                {licenseCheckboxes}
              </Col>
            </Row>
          </Grid>
        </Collapse>
        <Button onClick={() => this.toggleFiltersVisibility()}>
          Filters {collapseIcon}
        </Button>
      </div>
    );
  }

  renderHeaders() {
    const columns = [
      ['Name', 'name'],
      ['Race'],
      ['Cost', 'cost'],
      ['Category'],
      ['Hull', 'hull'],
      ['Shields', 'shields'],
      ['Mass', 'mass'],
      ['Engine cap.', 'engineCapacity'],
      ['Weapon cap.', 'weaponCapacity'],
      ['Fuel cap.', 'fuelCapacity'],
      ['Outfit sp.', 'outfitSpace'],
      ['Cargo sp.', 'cargoSpace'],
      ['Crew / bunks', 'bunks'],
      ['Licenses']
    ]

    return columns.map(([text, sortBy]) => {
      let title, icon;

      if (sortBy) {
        title = <a className="table-header" onClick={() => this.toggleOrdering(sortBy)}>{text}</a>;

        if (this.state.ordering.columnName === sortBy) {
          if (this.state.ordering.order === 'asc') {
            icon = <span className="glyphicon glyphicon-sort-by-attributes"></span>;
          } else {
            icon = <span className="glyphicon glyphicon-sort-by-attributes-alt"></span>;
          }
        }
      } else {
        title = text;
      }

      return (
        <th className="text-center" key={text}>
          {title}
          {' '}
          {icon}
        </th>
      );
    });
  }

  renderLabel(text) {
    const style = this.licenses[text] || text;
    return (<span className={'label label-' + style} key={text}>{text}</span>);
  }

  renderLicenses(ship) {
    return ship.licenses.map(
      license => this.renderLabel(license)
    ).reduce(
      (licenses, license) => (licenses === null ? [license] : [...licenses, ' ', license]),
      null
    );
  }

  processedRows() {
    const filters = [
      ship => this.state.raceFilter[ship.race],
      ship => this.state.categoryFilter[ship.category],
      ship => R.none(license => !this.state.licenseFilter[license])(ship.licenses)
    ];

    const prop = R.propOr(0, this.state.ordering.columnName);
    const sortedProp = (this.state.ordering.order === 'asc') ? R.ascend(prop) : R.descend(prop);
    const comparator = R.sort(sortedProp);

    return comparator(R.filter(R.allPass(filters), this.state.data));
  }

  renderRows() {
    return this.processedRows().map(ship => (
      <tr key={ship.name}>
        <TextCell text={ship.name} />
        <TextCell text={this.renderLabel(ship.race)} />
        <NumberCell number={ship.cost} />
        <TextCell text={ship.category} />
        <NumberCell number={ship.hull} />
        <NumberCell number={ship.shields} />
        <NumberCell number={ship.mass} />
        <NumberCell number={ship.engineCapacity} />
        <NumberCell number={ship.weaponCapacity} />
        <NumberCell number={ship.fuelCapacity} />
        <NumberCell number={ship.outfitSpace} />
        <NumberCell number={ship.cargoSpace} />
        <CrewAndBunks crew={ship.requiredCrew} bunks={ship.bunks} />
        <TextCell text={this.renderLicenses(ship)} />
      </tr>
    ));
  }

  renderTable() {
    return (
      <Table striped bordered condensed hover>
        <thead>
          <tr>
            {this.renderHeaders()}
          </tr>
        </thead>
        <tbody>
          {this.renderRows()}
        </tbody>
      </Table>
    );
  }

  render() {
    if (this.state.isLoading) {
      return (<div className="App">Loading...</div>);
    } else {
      return (
        <Grid fluid={true}>
          <Row>
            <Col lg={12}>
              <PageHeader>
                Welcome to Endless Sky encyclopedia!
              </PageHeader>
              {this.renderFilters()}
              {this.renderTable()}
            </Col>
          </Row>
        </Grid>
      );
    }
  }
}

export default App;
