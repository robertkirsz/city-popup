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

// Fade in/out transition
const Fade = props => (
  <CSSTransition timeout={300} classNames="city-popup-animation-fade" mountOnEnter unmountOnExit {...props} />
)

// A list of buttons that launches the popup
const ChooseCityButtons = ({ cities, onClick }) =>
  cities.map(city => (
    <button key={city.id} onClick={onClick(city.id)}>
      {city.title.rendered}
    </button>
  ))

// An array of cities
const citiesData = [
  { id: 207, name: 'Kordoba', coords: '472,266,579,264,579,300,473,299' },
  { id: 196, name: 'Grenada', coords: '749,403,854,401,855,436,749,437' },
  { id: 202, name: 'Orgivia', coords: '796,464,907,464,908,501,802,497' },
  { id: 180, name: 'Nerja', coords: '733,513,811,512,811,549,732,551' },
  { id: 199, name: 'Malaga', coords: '607,496,707,497,710,535,614,535' },
  { id: 210, name: 'El Chorro', coords: '466,491,579,490,577,522,465,520' },
  { id: 191, name: 'Ronda', coords: '422,524,512,522,510,554,426,555' },
  { id: 188, name: 'Marbella', coords: '452,556,561,554,556,591,452,589' },
  { id: 205, name: 'Gibraltar', coords: '435,657,550,655,550,690,440,691' },
  { id: 175, name: 'Tarifa', coords: '344,672,431,672,431,710,346,709' },
  { id: 183, name: 'Kadyks', coords: '237,558,339,557,338,596,238,597' },
  { id: 185, name: 'Sewilla', coords: '271,380,377,381,373,415,271,414' }
]

// The main popup component
class CityPopup extends Component {
  state = {
    showPopup: false,
    cities: [],
    activeCityIndex: null,
    activeCity: {
      image: '',
      title: { rendered: '' },
      content: { rendered: '' }
    }
  }

  componentDidMount() {
    // Download the list of cities that will be used to create the buttons and display city's info and image
    $.ajax('http://solo.waw.pl/wp-json/wp/v2/posts?categories=2&per_page=20').done(response => {
      this.setState({ cities: response })
    })
  }

  // Opens the popup
  chooseCity = id => e => {
    e.preventDefault()
    this.setState({ showPopup: true })
    this.loadImage(this.state.cities.findIndex(city => city.id === id))
  }

  // Loads the city image
  loadImage = index => {
    const activeCity = this.state.cities[index]
    const featuredMedia = activeCity._links['wp:featuredmedia'] || []

    // Return if the image is already downloaded, or there is no image to be displayed
    if (activeCity.image || !featuredMedia.length) {
      this.setState({ activeCityIndex: index, activeCity })
      return
    }

    this.setState({ loadingImage: true })

    // Fetch image and save it to the state
    $.ajax(featuredMedia[0].href).done(response => {
      const image = (response.media_details.sizes.large || response.media_details.sizes.medium).source_url
      const cities = this.state.cities.map((city, i) => (i !== index ? city : { ...city, image }))

      preloadImage(image).then(() => {
        setTimeout(() => {
          this.setState({
            cities,
            activeCityIndex: index,
            activeCity: cities[index],
            loadingImage: false
          })
        }, 400)
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
    const { cities, loadingImage, showPopup, activeCity } = this.state

    return (
      <Fragment>
        <ChooseCityButtons cities={cities} onClick={this.chooseCity} />

        <div>
          <img
            src="http://solo.waw.pl/wp-content/uploads/2017/12/Andaluzaj_ramka_final.png"
            alt="Andaluzja map"
            useMap="#map_andaluzja"
            style={{ marginTop: 30 }}
          />
          <map name="map_andaluzja">
            {citiesData.map(city => (
              <area
                onClick={this.chooseCity(city.id)}
                alt={city.name}
                title={city.name}
                key={city.id}
                href="#"
                shape="poly"
                coords={city.coords}
              />
            ))}
          </map>
        </div>

        <Fade in={showPopup}>
          <div className="city-popup" onClick={this.closePopup}>
            <div className="city-popup__box" onClick={e => e.stopPropagation()}>
              <h2 className="city-popup__title">Twoja baza wypadowa</h2>

              <button className="city-popup__arrow-left" onClick={this.goPrev} />
              <button className="city-popup__arrow-right" onClick={this.goNext} />

              <div className="city-popup__flex-row">
                <div className="city-popup__flex-column">
                  <div className="city-popup__image-box" style={{ minHeight: activeCity.image ? 0 : 300 }}>
                    <Fade in={loadingImage}>
                      <Loader />
                    </Fade>
                    {activeCity.image && <img className="city-popup__image" src={activeCity.image} alt="" />}
                    <h2 className="city-popup__city-name">{activeCity.title.rendered}</h2>
                  </div>
                </div>
                <div className="city-popup__flex-column">
                  <div className="city-popup__info" dangerouslySetInnerHTML={{ __html: activeCity.content.rendered }} />
                  <button className="city-popup__button">Zarezerwuj</button>
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </Fragment>
    )
  }
}

ReactDOM.render(<CityPopup />, document.getElementById('city-popup'))
