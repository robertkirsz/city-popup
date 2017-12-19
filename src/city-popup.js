const { React, ReactTransitionGroup, $, ReactDOM } = window
const { Component, Fragment } = React
const { CSSTransition } = ReactTransitionGroup

// Returns a Promise that resolves when the image is ready to be displayed
const preloadImage = src =>
  new Promise(resolve => {
    if (!src) {
      resolve()
      return
    }

    const img = new Image()
    img.onload = resolve
    img.src = src
  })

// Loader/spinner element
const Loader = () => (
  <div className="city-popup__spinner-overlay">
    <div className="city-popup__spinner">
      <div className="city-popup__spinner-bounce1" />
      <div className="city-popup__spinner-bounce2" />
    </div>
  </div>
)

// A list of buttons that launches the popup
const ChooseCityButtons = ({ cities, onClick }) =>
  cities.map(city => (
    <button key={city.id} onClick={onClick(city.id)}>
      {city.title.rendered}
    </button>
  ))

// The main popup component
class CityPopup extends Component {
  state = {
    showPopup: false,
    cities: [],
    activeCityIndex: null
  }

  componentDidMount() {
    // Download the list of cities that will be used to create the buttons and display city's info and image
    $.ajax('http://solo.waw.pl/wp-json/wp/v2/posts?categories=2').done(response => {
      this.setState({ cities: response })
    })
  }

  // Opens the popup
  chooseCity = id => e => {
    this.setState({ showPopup: true })

    this.loadImage(this.state.cities.findIndex(city => city.id === id))
  }

  // Loads the city image
  loadImage = index => {
    const activeCity = this.state.cities[index]
    const featuredMedia = activeCity._links['wp:featuredmedia'] || []

    // Return if the image is already downloaded, or there is no image to be displayed
    if (activeCity.image || !featuredMedia.length) {
      this.setState({ activeCityIndex: index })
      return
    }

    this.setState({ loadingImage: true })

    // Fetch image and save it to the state
    $.ajax(featuredMedia[0].href).done(response => {
      const image = (response.media_details.sizes.large || response.media_details.sizes.medium).source_url
      const cities = this.state.cities.map((city, i) => (i !== index ? city : { ...activeCity, image }))

      preloadImage(image).then(() => {
        setTimeout(() => {
          this.setState({
            cities,
            activeCityIndex: index,
            loadingImage: false
          })
        }, 300)
      })
    })
  }

  // Displays the next city info
  goNext = () => {
    if (this.state.loadingImage) return
    this.loadImage(this.state.activeCityIndex === this.state.cities.length - 1 ? 0 : this.state.activeCityIndex + 1)
  }

  // Displays the previous city info
  goPrev = () => {
    if (this.state.loadingImage) return
    this.loadImage(this.state.activeCityIndex === 0 ? this.state.cities.length - 1 : this.state.activeCityIndex - 1)
  }

  // Closes the popup :)
  closePopup = () => this.setState({ showPopup: false })

  render = () => {
    const { cities, loadingImage, showPopup } = this.state
    const activeCity = this.state.cities[this.state.activeCityIndex]

    return (
      <Fragment>
        <ChooseCityButtons cities={cities} onClick={this.chooseCity} />

        <CSSTransition in={showPopup} timeout={300} classNames="city-popup-animation-fade" mountOnEnter unmountOnExit>
          <div className="city-popup" onClick={this.closePopup}>
            <div className="city-popup__box" onClick={e => e.stopPropagation()}>
              <h2 className="city-popup__title">Twoja baza wypadowa</h2>

              <button className="city-popup__arrow-left" onClick={this.goPrev} />
              <button className="city-popup__arrow-right" onClick={this.goNext} />

              {activeCity && (
                <CSSTransition
                  in={showPopup}
                  classNames="city-popup-animation-fade"
                  timeout={300}
                  mountOnEnter
                  unmountOnExit
                >
                  <div className="city-popup__flex-row">
                    <div className="city-popup__flex-column">
                      <div className="city-popup__image-box">
                        {loadingImage ? (
                          <Loader />
                        ) : (
                          <img className="city-popup__image" src={activeCity.image} alt="" />
                        )}
                        <h2 className="city-popup__city-name">{activeCity.title.rendered}</h2>
                      </div>
                    </div>
                    <div className="city-popup__flex-column">
                      <div
                        className="city-popup__info"
                        dangerouslySetInnerHTML={{ __html: activeCity.content.rendered }}
                      />
                      <button className="city-popup__button">Zarezerwuj</button>
                    </div>
                  </div>
                </CSSTransition>
              )}
            </div>
          </div>
        </CSSTransition>
      </Fragment>
    )
  }
}

ReactDOM.render(<CityPopup />, document.getElementById('city-popup'))
