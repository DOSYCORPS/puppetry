import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Row, Col, Select, Input } from "antd";
import If from "component/Global/If";
import { getAssertion } from "./helpers";
import AbstractComponent from "component/AbstractComponent";

const Option = Select.Option,
      FormItem = Form.Item;

export class AssertAttribute extends AbstractComponent {

  state = {
    assertion: "",
    type: ""
  }

  static propTypes = {
    record: PropTypes.object.isRequired,
    onPressEnter: PropTypes.func.isRequired,
    form: PropTypes.shape({
      getFieldDecorator: PropTypes.func.isRequired
    })
  }

  onSelectAssertion = ( value ) => {
    this.setState({
      assertion: value
    });
  }

  onSelectType = ( value ) => {
    this.setState({
      type: value
    });
  }

  render () {
    const { getFieldDecorator } = this.props.form,
          { record } = this.props,
          assertion = this.state.assertion || getAssertion( record ).assertion || "equals",
          value = record.assert.value || "";
    return (
      <Row gutter={24}>

        <Col span={8} >
          <FormItem label="Result">
            { getFieldDecorator( "assert.assertion", {
              initialValue: assertion,
              rules: [{
                required: true
              }]
            })( <Select
              onSelect={ this.onSelectAssertion }>
              <Option value="equals">equals</Option>
              <Option value="contains">contains</Option>
              <Option value="hasAttribute">is present</Option>
              <Option value="!equals">does not equal</Option>
              <Option value="!contains">does not contain</Option>
              <Option value="!hasAttribute">is absent</Option>
            </Select> ) }
          </FormItem>
          { ( assertion === "set" || assertion === "!set" ) && <div className="under-field-description">
           A number of attributes are boolean attributes. The presence of a boolean attribute on an element
            represents the true <code>value</code>, and the absence of the attribute
            represents the <code>false</code> value.
            { "" } <a onClick={ this.onExtClick }
              href="http://www.w3.org/TR/html5/infrastructure.html#boolean-attributes">
            HTML Living Standard</a>
          </div> }
        </Col>


        <If exp={ ( assertion === "contains" || assertion === "!contains" ) }>
          <Col span={12} >
            <FormItem label="Value">
              { getFieldDecorator( "assert.value", {
                initialValue: value,
                rules: [{
                  required: true
                }]
              })(
                <Input onPressEnter={ ( e ) => this.props.onPressEnter( e ) } />
              ) }
            </FormItem>
            <div className="under-field-description">You can use
              { "" } <a onClick={ this.onExtClick } href="https://docs.puppetry.app/template">
              template expressions</a>
            </div>
          </Col>
        </If>

        <If exp={ ( assertion === "equals" || assertion === "!equals" ) }>
          <Col span={12} >

            <FormItem label="Value">
              { getFieldDecorator( "assert.value", {
                initialValue: value
              })(
                <Input onPressEnter={ ( e ) => this.props.onPressEnter( e ) } />
              ) }
            </FormItem>
            <div className="under-field-description">You can use
              { "" } <a onClick={ this.onExtClick } href="https://docs.puppetry.app/template">
                template expressions</a>
            </div>

          </Col>
        </If>

      </Row> );
  }


}
