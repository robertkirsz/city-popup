"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _window = window,
    React = _window.React,
    ReactTransitionGroup = _window.ReactTransitionGroup,
    $ = _window.$,
    ReactDOM = _window.ReactDOM;
var Component = React.Component,
    Fragment = React.Fragment;
var CSSTransition = ReactTransitionGroup.CSSTransition;

// Returns a Promise that resolves when the image is ready to be displayed

var preloadImage = function preloadImage(src) {
  return new Promise(function (resolve) {
    if (!src) {
      resolve();
      return;
    }

    var img = new Image();
    img.onload = resolve;
    img.src = src;
  });
};

// Loader/spinner element
var Loader = function Loader() {
  return React.createElement(
    "div",
    { className: "city-popup__spinner-overlay" },
    React.createElement(
      "div",
      { className: "city-popup__spinner" },
      React.createElement("div", { className: "city-popup__spinner-bounce1" }),
      React.createElement("div", { className: "city-popup__spinner-bounce2" })
    )
  );
};

// A list of buttons that launches the popup
var ChooseCityButtons = function ChooseCityButtons(_ref) {
  var cities = _ref.cities,
      onClick = _ref.onClick;
  return cities.map(function (city) {
    return React.createElement(
      "button",
      { key: city.id, onClick: onClick(city.id) },
      city.title.rendered
    );
  });
};

// An array of cities
var citiesData = [{ id: 207, name: 'Kordoba', coords: '472,266,579,264,579,300,473,299' }, { id: 196, name: 'Grenada', coords: '749,403,854,401,855,436,749,437' }, { id: 202, name: 'Orgivia', coords: '796,464,907,464,908,501,802,497' }, { id: 180, name: 'Nerja', coords: '733,513,811,512,811,549,732,551' }, { id: 199, name: 'Malaga', coords: '607,496,707,497,710,535,614,535' }, { id: 210, name: 'El Chorro', coords: '466,491,579,490,577,522,465,520' }, { id: 191, name: 'Ronda', coords: '422,524,512,522,510,554,426,555' }, { id: 188, name: 'Marbella', coords: '452,556,561,554,556,591,452,589' }, { id: 205, name: 'Gibraltar', coords: '435,657,550,655,550,690,440,691' }, { id: 175, name: 'Tarifa', coords: '344,672,431,672,431,710,346,709' }, { id: 183, name: 'Kadyks', coords: '237,558,339,557,338,596,238,597' }, { id: 185, name: 'Sewilla', coords: '271,380,377,381,373,415,271,414' }];

// The main popup component

var CityPopup = function (_Component) {
  _inherits(CityPopup, _Component);

  function CityPopup() {
    var _ref2;

    var _temp, _this, _ret;

    _classCallCheck(this, CityPopup);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = CityPopup.__proto__ || Object.getPrototypeOf(CityPopup)).call.apply(_ref2, [this].concat(args))), _this), _this.state = {
      showPopup: false,
      cities: [],
      activeCityIndex: null
    }, _this.chooseCity = function (id) {
      return function (e) {
        e.preventDefault();
        _this.setState({ showPopup: true });
        _this.loadImage(_this.state.cities.findIndex(function (city) {
          return city.id === id;
        }));
      };
    }, _this.loadImage = function (index) {
      var activeCity = _this.state.cities[index];
      var featuredMedia = activeCity._links['wp:featuredmedia'] || [];

      // Return if the image is already downloaded, or there is no image to be displayed
      if (activeCity.image || !featuredMedia.length) {
        _this.setState({ activeCityIndex: index });
        return;
      }

      _this.setState({ loadingImage: true });

      // Fetch image and save it to the state
      $.ajax(featuredMedia[0].href).done(function (response) {
        var image = (response.media_details.sizes.large || response.media_details.sizes.medium).source_url;
        var cities = _this.state.cities.map(function (city, i) {
          return i !== index ? city : _extends({}, activeCity, { image: image });
        });

        preloadImage(image).then(function () {
          setTimeout(function () {
            _this.setState({
              cities: cities,
              activeCityIndex: index,
              loadingImage: false
            });
          }, 300);
        });
      });
    }, _this.goNext = function () {
      if (_this.state.loadingImage) return;
      _this.loadImage(_this.state.activeCityIndex === _this.state.cities.length - 1 ? 0 : _this.state.activeCityIndex + 1);
    }, _this.goPrev = function () {
      if (_this.state.loadingImage) return;
      _this.loadImage(_this.state.activeCityIndex === 0 ? _this.state.cities.length - 1 : _this.state.activeCityIndex - 1);
    }, _this.closePopup = function () {
      return _this.setState({ showPopup: false });
    }, _this.render = function () {
      var _this$state = _this.state,
          cities = _this$state.cities,
          loadingImage = _this$state.loadingImage,
          showPopup = _this$state.showPopup;

      var activeCity = _this.state.cities[_this.state.activeCityIndex];

      return React.createElement(
        Fragment,
        null,
        React.createElement(ChooseCityButtons, { cities: cities, onClick: _this.chooseCity }),
        React.createElement(
          "div",
          null,
          React.createElement("img", {
            src: "http://solo.waw.pl/wp-content/uploads/2017/12/Andaluzaj_ramka_final.png",
            alt: "Andaluzja map",
            useMap: "#map_andaluzja",
            style: { marginTop: 30 }
          }),
          React.createElement(
            "map",
            { name: "map_andaluzja" },
            citiesData.map(function (city) {
              return React.createElement("area", {
                onClick: _this.chooseCity(city.id),
                alt: city.name,
                title: city.name,
                key: city.id,
                href: "#",
                shape: "poly",
                coords: city.coords
              });
            })
          )
        ),
        React.createElement(
          CSSTransition,
          { "in": showPopup, timeout: 300, classNames: "city-popup-animation-fade", mountOnEnter: true, unmountOnExit: true },
          React.createElement(
            "div",
            { className: "city-popup", onClick: _this.closePopup },
            React.createElement(
              "div",
              { className: "city-popup__box", onClick: function onClick(e) {
                  return e.stopPropagation();
                } },
              React.createElement(
                "h2",
                { className: "city-popup__title" },
                "Twoja baza wypadowa"
              ),
              React.createElement("button", { className: "city-popup__arrow-left", onClick: _this.goPrev }),
              React.createElement("button", { className: "city-popup__arrow-right", onClick: _this.goNext }),
              activeCity && React.createElement(
                CSSTransition,
                {
                  "in": showPopup,
                  classNames: "city-popup-animation-fade",
                  timeout: 300,
                  mountOnEnter: true,
                  unmountOnExit: true
                },
                React.createElement(
                  "div",
                  { className: "city-popup__flex-row" },
                  React.createElement(
                    "div",
                    { className: "city-popup__flex-column" },
                    React.createElement(
                      "div",
                      { className: "city-popup__image-box" },
                      loadingImage ? React.createElement(Loader, null) : React.createElement("img", { className: "city-popup__image", src: activeCity.image, alt: "" }),
                      React.createElement(
                        "h2",
                        { className: "city-popup__city-name" },
                        activeCity.title.rendered
                      )
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "city-popup__flex-column" },
                    React.createElement("div", {
                      className: "city-popup__info",
                      dangerouslySetInnerHTML: { __html: activeCity.content.rendered }
                    }),
                    React.createElement(
                      "button",
                      { className: "city-popup__button" },
                      "Zarezerwuj"
                    )
                  )
                )
              )
            )
          )
        )
      );
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(CityPopup, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      // Download the list of cities that will be used to create the buttons and display city's info and image
      $.ajax('http://solo.waw.pl/wp-json/wp/v2/posts?categories=2&per_page=20').done(function (response) {
        _this2.setState({ cities: response });
      });
    }

    // Opens the popup


    // Loads the city image


    // Displays the next city info


    // Displays the previous city info


    // Closes the popup :)

  }]);

  return CityPopup;
}(Component);

ReactDOM.render(React.createElement(CityPopup, null), document.getElementById('city-popup'));
