'use strict';

const api = 'https://script.google.com/macros/s/AKfycbywckyAjIVuIAEItBJDr54e3e4ZzpxEjBiQGyxb5dLJAAZ5qMDXWYu5KJ8kqo5rMJEZ2g/exec';

class MainForm extends React.Component {
  state = {
    isLoading: true,
    stand_info: [],
    error: null,
    send_state: "SEND",
  };
  getStandInfo() {
    var params = location.search.match(/code\=(\w+)/);
    if (params[1]) {
      const code = params[1];
      this.setState({
        code: code,
        loading: true
      }, () => {
        fetch(api+'?code='+code).then(res => res.json()).then(result => this.setState({
          loading: false,
          stand_info: result
        })).catch(console.log);
      });
    }
    else {
      this.setState({
        error: 'Empty param string for stand code'
      });
    }
  }
  componentDidMount() {
    this.getStandInfo();
  }
  sendInfo = () => {
    this.setState({send_state: 'Sending ...'});
    var res = {'code': this.state.code, counts: {}};
    for (var i=1;i<=Object.keys(this.state.stand_info['magazines']).length;i++) {
      const name = document.getElementById('m'+i).textContent;
      res['counts'][name] = [
        this.state.stand_info['magazines'][name],
        parseInt(document.getElementById('r'+i).value),
        parseInt(document.getElementById('a'+i).value)
      ];
    }
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(res),
        mode: 'no-cors',
    };
    fetch(api, requestOptions)
        .then(response => this.setState({send_state: 'SUCCESFULLY SENT'}))
        .catch(err => {if (err) this.setState({send_state: 'Error sending'})});
  }
  render() {
    const {loading, stand_info, error} = this.state;
    let form;
    if (error) {
      form = <h2 style={{color: 'red'}}>Error: {error}</h2>;
    }
    else if (loading) {
      form = <h2>Loading ...</h2>;
    }
    else {
      var rows = [];
      var row = 1;
      for ( var magazine in stand_info['magazines'] ) {
        rows.push(
          <React.Fragment key={row}>
          <tr>
          <td id={'m'+row}>{magazine}</td>
          <td style={{'textAlign': 'center'}}>{stand_info['magazines'][magazine]}</td>
          <td style={{'textAlign': 'center'}}><NumberInput id={'r'+row} value={0}/></td>
          <td style={{'textAlign': 'center'}}><NumberInput id={'a'+row} value={stand_info['magazines'][magazine]}/></td>
          </tr>
          </React.Fragment>
        );
        row++;
      }
      form = (
        <React.Fragment>
        <h2>[{stand_info['code']}] {stand_info['name']} ({stand_info['address']})</h2>
        <table width="95%">
        <thead>
          <tr>
          <th>Magazine name</th>
          <th>Target count</th>
          <th>Removed</th>
          <th>Added</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
        <tfoot style={{'textAlign':'center'}}>
          <tr><td colSpan="4">
            <button style={{'marginTop':'10pt'}} onClick={this.sendInfo}>
              {this.state.send_state}
            </button>
          </td></tr>
        </tfoot>
        </table>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
      <h1>Magazine Stand Visit Form</h1>
      {form}
      </React.Fragment>
    );
  }
}

class NumberInput extends React.Component {
  state = {
    value: 0
  };

  componentDidMount() {
    this.setState({value: this.props.value});
  }

  addVal(increment) {
    if ( isNaN(this.state.value) ) {
      this.setState({value: 0});
    }
    const new_val = this.state.value + increment;
    if ( new_val >= 0 )
      this.setState({value: new_val});
  }

  incrementVal = () => { this.addVal(1); }
  decrementVal = () => { this.addVal(-1); }

  inputChangedHandler = (e) => {
    var val = e.target.value;
    var num = parseInt(val);
    if (isNaN(num)) {
      num = 0;
    }
    else if (num < 0) {
      num = 0;
    }
    this.setState({value: num});
  }

  render() {
    return (
      <React.Fragment>
      <input type="button" value="-" onClick={this.decrementVal}/>
      <input id={this.props.id} style={{'textAlign': 'right'}}
        onChange={this.inputChangedHandler}
        type="text" size="4" value={this.state.value}/>
      <input type="button" value="+" onClick={this.incrementVal}/>
      </React.Fragment>
    )
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
const e = <MainForm/>;
root.render(e);
