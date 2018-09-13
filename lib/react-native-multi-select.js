import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
  UIManager,
  LayoutAnimation,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import reject from 'lodash/reject';
import find from 'lodash/find';
import get from 'lodash/get';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconIonic from 'react-native-vector-icons/Ionicons';


import styles, { colorPack } from './styles';

export default class MultiSelect extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    single: PropTypes.bool,
    selectedItems: PropTypes.array,
    readOnlyItems: PropTypes.array,
    items: PropTypes.array.isRequired,
    uniqueKey: PropTypes.string,
    tagBorderColor: PropTypes.string,
    tagTextColor: PropTypes.string,
    fontFamily: PropTypes.string,
    tagRemoveIconColor: PropTypes.string,
    onSelectedItemsChange: PropTypes.func.isRequired,
    selectedItemFontFamily: PropTypes.string,
    selectedItemTextColor: PropTypes.string,
    readOnlyItemTextColor: PropTypes.string,
    tagBackgroundColor: PropTypes.string,
    tagFontFamily: PropTypes.string,
    itemFontFamily: PropTypes.string,
    itemTextColor: PropTypes.string,
    selectedItemIconColor: PropTypes.string,
    searchInputPlaceholderText: PropTypes.string,
    searchInputStyle: PropTypes.object,
    selectText: PropTypes.string,
    altFontFamily: PropTypes.string,
    hideSubmitButton: PropTypes.bool,
    submitButtonColor: PropTypes.string,
    submitButtonText: PropTypes.string,
    textColor: PropTypes.string,
    fontSize: PropTypes.number,
    fixedHeight: PropTypes.bool,
    displayVal: PropTypes.string,
    callback: PropTypes.func.isRequired
  };

  static defaultProps = {
    disabled: false,
    single: false,
    selectedItems: [],
    readOnlyItems: [],
    items: [],
    uniqueKey: '_id',
    tagBorderColor: colorPack.primary,
    tagTextColor: colorPack.primary,
    fontFamily: '',
    tagRemoveIconColor: colorPack.danger,
    selectedItemFontFamily: '',
    selectedItemTextColor: colorPack.primary,
    readOnlyItemTextColor: colorPack.primaryDark,
    tagBackgroundColor: colorPack.primaryDark,
    tagFontFamily: '',
    itemFontFamily: '',
    itemTextColor: colorPack.textPrimary,
    selectedItemIconColor: colorPack.primary,
    searchInputPlaceholderText: 'Search',
    searchInputStyle: { color: colorPack.textPrimary },
    textColor: colorPack.textPrimary,
    selectText: 'Select',
    altFontFamily: '',
    hideSubmitButton: false,
    submitButtonColor: '#CCC',
    submitButtonText: 'Submit',
    fontSize: 14,
    fixedHeight: false,
    callback: () => {},
    onSelectedItemsChange: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      selector: false,
      searchTerm: '',
      itemSelectedText: this.props.selectText
    };
    if (Platform.OS === 'android') {
      // set UIManager LayoutAnimationEnabledExperimental
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  };

  _findItem = (itemKey) => {
    const {
      items,
      uniqueKey,
      single,
    } = this.props;
    var key = itemKey
    /* if (single) {
      key = itemKey[0]
    } */
    const res = items.find(singleItem => (
      singleItem[uniqueKey] === key
    ));
    return res || null
  };

  _getSelectLabel = (props) => {
    const { selectText, single, items, selectedItems } = props;
    if (!selectedItems || selectedItems.length === 0) {
      return selectText;
    } else if (single) {
      //if (items.length > 0) {
      //  const foundItem = this._findItem(selectedItems);
      //  if (foundItem) {
      //    return get(foundItem, 'name')
      //  }
      //} else {
        return selectText
      //}
    }
    return `${selectText}`
  };

  _displaySelectedItems = () => {
    const {
      fontFamily,
      tagRemoveIconColor,
      tagBorderColor,
      uniqueKey,
      tagTextColor,
      selectedItems,
      tagBackgroundColor,
      tagFontFamily,
      items,
      displayVal,
      callback
    } = this.props;
    let items_to_render = []
    if (items.length > 0) {
      items_to_render = selectedItems.map(singleSelectedItem => {
        const item = this._findItem(singleSelectedItem);
        let displayItem = item.name
        if (displayVal) {
          displayItem = item[displayVal]
        }
        return (
          item?
          <View
          style={[
            styles.selectedItem,
            {
              backgroundColor: tagBackgroundColor,
              width: displayItem.length * 8 + 65,
              justifyContent: 'center',
              height: 40,
              borderColor: tagBorderColor,
            },
          ]}
          key={item[uniqueKey]}
          >
          <Text
          style={[
            {
              flex: 1,
              color: tagTextColor,
              fontFamily: tagFontFamily,
              fontSize: 16,
            },
            fontFamily ? { fontFamily } : {},
          ]}
          >
          {displayItem}
          </Text>
          <TouchableOpacity onPress={() => { this._removeItem(item); }}>
          <Icon
          name="cancel"
          style={{
            color: tagRemoveIconColor,
            fontSize: 20,
            marginLeft: 10,
          }}
          />
          </TouchableOpacity>
          </View>
          : null
        )
      });

    }
    callback(selectedItems)
    return items_to_render;
  };

  componentWillReceiveProps(nextProps) {
    const label = this._getSelectLabel(nextProps)
    this.setState({
      itemSelectedText: label
    })
  }

  _handleSelectedItemsChange = (newItems, newText) => {
    this.props.onSelectedItemsChange(newItems)
    const label = this._getSelectLabel(this.props)
    this.setState({
      itemSelectedText: label
    })
  }

  _removeItem = (item) => {
    const {
      uniqueKey,
      selectedItems,
      readOnlyItems,
      callback
    } = this.props;
    let newItems = reject(selectedItems, singleItem => {
      let filtered = readOnlyItems.find(function (o) { return o === singleItem});
      return item[uniqueKey] === singleItem && !filtered;
    });
    // broadcast new selected items state to parent component
    this._handleSelectedItemsChange(newItems);
    callback(newItems);
  };

  _removeAllItems = () => {
    const { 
      readOnlyItems
    } = this.props;
    // broadcast new selected items state to parent component
    this._handleSelectedItemsChange([]);
    callback([]);
  };

  _toggleSelector = () => {
    //LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      selector: !this.state.selector,
    });
  };

  _submitSelection = () => {
    this._toggleSelector();
    // reset searchTerm
    this.setState({ searchTerm: '' });
  };

  _itemSelected = (item) => {
    const { uniqueKey, selectedItems } = this.props;
    return (
      !!find(selectedItems, singleItem => (
        item[uniqueKey] === singleItem
      ))
    );
  }

  _itemReadOnly = (item) => {
    const { uniqueKey, readOnlyItems } = this.props;
    return (
      !!find(readOnlyItems, singleItem => (
        item[uniqueKey] === singleItem
      ))
    );
  }

  _toggleItem = (item) => {
    const {
      single,
      uniqueKey,
      selectedItems,
      readOnlyItems,
      callback
    } = this.props;
    if (single) {
      this._submitSelection();
      this._handleSelectedItemsChange([item[uniqueKey]]);
      callback([item[uniqueKey]]);
    } else {
      const status = this._itemSelected(item);
      let newItems = [];
      if (status) {
        newItems = reject(selectedItems, singleItem => {
          let filtered = readOnlyItems.find(function (o) { return o === singleItem});
          return item[uniqueKey] === singleItem && !(filtered)
        });
      } else {
        newItems = [...selectedItems, item[uniqueKey]];
      }
      // broadcast new selected items state to parent component
      this._handleSelectedItemsChange(newItems);
      callback(newItems);
    }
  };

  _itemStyle = (item) => {
    const {
      selectedItemFontFamily,
      selectedItemTextColor,
      readOnlyItemTextColor,
      itemFontFamily,
      itemTextColor,
    } = this.props;
    const isSelected = this._itemSelected(item);
    const isReadOnly = this._itemReadOnly(item);
    const fontFamily = {};
    if (isSelected && selectedItemFontFamily) {
      fontFamily.fontFamily = selectedItemFontFamily;
    } else if (!isSelected && itemFontFamily) {
      fontFamily.fontFamily = itemFontFamily;
    }
    let color = isSelected ? { color: selectedItemTextColor } : { color: itemTextColor };
    color = isReadOnly && isSelected ? { color: readOnlyItemTextColor } : color;
    return {
      ...fontFamily,
      ...color,
    };
  };

  _getRow = (item) => {
    const { selectedItemIconColor } = this.props;
    return (
      <TouchableOpacity
        onPress={() => this._toggleItem(item)}
        style={{ paddingLeft: 20, paddingRight: 20 }}
      >
        <View>
          <View style={{flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={[
                {
                  flex: 1,
                  fontSize: 16,
                  paddingTop: 5,
                  paddingBottom: 5,
                },
                this._itemStyle(item),
              ]}
            >
              {item.name}
            </Text>
            {
              this._itemSelected(item) ?
                <Icon
                  name="check"
                  style={{
                    fontSize: 20,
                    color: selectedItemIconColor,
                  }}
                /> :
                null
            }
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  _filterItems = (searchTerm) => {
    const { items } = this.props;
    const filteredItems = [];
    items.forEach((item) => {
      const parts = searchTerm.trim().split(/[ \-:]+/);
      const regex = new RegExp(`(${parts.join('|')})`, 'ig');
      if (regex.test(get(item, 'name'))) {
        filteredItems.push(item);
      }
    });
    return filteredItems;
  };

  _renderItems = () => {
    const {
      items,
      fontFamily,
      uniqueKey,
      selectedItems,
    } = this.props;
    const { searchTerm } = this.state;
    let component = null;
    const renderItems = searchTerm ? this._filterItems(searchTerm.trim()) : items;
    if (renderItems.length) {
      component = (
        <FlatList
          data={renderItems}
          extraData={selectedItems}
          keyExtractor={item => item[uniqueKey]}
          renderItem={rowData => this._getRow(rowData.item)}
        />
      );
    } else {
      component = (
        <View
          style={{flexDirection: 'row', alignItems: 'center' }}
        >
          <Text
            style={[
              {
                flex: 1,
                marginTop: 20,
                textAlign: 'center',
                color: colorPack.danger,
              },
              fontFamily ? { fontFamily } : {},
            ]}
          >
            No item to display.
          </Text>
        </View>
      );
    }
    return component;
  };

  render() {
    const {
      disabled,
      selectedItems,
      single,
      fontFamily,
      altFontFamily,
      searchInputPlaceholderText,
      searchInputStyle,
      hideSubmitButton,
      submitButtonColor,
      submitButtonText,
      fontSize,
      textColor,
      fixedHeight,
    } = this.props;

    const { selector, itemSelectedText } = this.state;
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          marginBottom: 10,
        }}
      >
        {
          selector && !disabled
          ?
            <View style={styles.selectorView(fixedHeight)}>
              <View style={styles.inputGroup}>
                <IconIonic
                  name="ios-search"
                  size={20}
                  color={colorPack.placeholderTextColor}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  onChangeText={searchTerm => this.setState({ searchTerm })}
                  placeholder={searchInputPlaceholderText}
                  placeholderTextColor={colorPack.placeholderTextColor}
                  underlineColorAndroid="transparent"
                  style={[searchInputStyle, { flex: 1 }]}
                />
                {hideSubmitButton &&
                  <TouchableOpacity onPress={this._submitSelection}>
                    <IconIonic
                      name="md-arrow-dropdown"
                      style={[styles.indicator, { paddingRight: 15 }]}
                    />
                  </TouchableOpacity>
                }
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  backgroundColor: '#fafafa',
                }}
              >
                <View>
                  {this._renderItems()}
                </View>
                {
                  !single && !hideSubmitButton &&
                  <TouchableOpacity
                    onPress={this._submitSelection}
                    style={[styles.button, { backgroundColor: submitButtonColor }]}
                  >
                    <Text
                      style={[styles.buttonText, fontFamily ? { fontFamily } : { }]}
                    >
                      {submitButtonText}
                    </Text>
                  </TouchableOpacity>
                }
              </View>
            </View>
            :
            <View>
              <View style={styles.dropdownView}>
                <View style={[styles.subSection, { paddingTop: 10, paddingBottom: 10 }]}>
                  <TouchableWithoutFeedback onPress={this._toggleSelector}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      <Text
                        style={[
                          {
                            flex: 1,
                            fontSize: fontSize || 16,
                            color: textColor || colorPack.placeholderTextColor,
                          },
                          altFontFamily ? { fontFamily: altFontFamily } : fontFamily ? { fontFamily } : {},
                        ]}
                      >
                        { itemSelectedText }
                      </Text>
                      {!disabled && 
                      <IconIonic
                        name={hideSubmitButton ? "md-arrow-dropright" : "md-arrow-dropdown" }
                        style={styles.indicator}
                      />
                      }
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
              {
                (/*!single && */selectedItems.length) ?
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                    }}
                  >
                    {this._displaySelectedItems()}
                  </View>
                  :
                  null
              }
            </View>
        }
      </View>
    );
  }
}
