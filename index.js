"use strict";
import { createAutocomplete } from "./autocomplete.js";

const autocompleteConfig = {
  renderOption(movie) {
    const imgSrc =
      movie.Poster === "N/A"
        ? "https://demofree.sirv.com/nope-not-here.jpg"
        : movie.Poster;
    return `
        <img src="${imgSrc}" alt="${movie.Title} Image"/>
        <h1>${movie.Title} (${movie.Year})</h1>
        `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    try {
      const res = await axios.get("http://www.omdbapi.com/", {
        params: {
          apikey: "40892b5f",
          s: searchTerm,
        },
      });
      if (res.data.Error) {
        return [];
      }
      return res.data.Search || [];
    } catch (err) {
      console.error("error in fetching data: ", err);
      return [];
    }
  },
};


//store the leftside movie data and rightside data for run a comparison
//when both movies are successfully fetched therefore we can run comparison between them
let leftMovie;
let rightMovie;

const onMovieSelect = async (movie, summaryContainer, side) => {
  try {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "40892b5f",
        I: movie.imdbID,
      },
    });
    summaryContainer.innerHTML = movieTemplate(response.data);
    if (side === "left") {
      leftMovie = response.data;
    } else {
      rightMovie = response.data;
    }
    if (leftMovie && rightMovie) {
      runComparison();
    }
  } catch (error) {
    console.error("error fetching in movie details: ", error);
  }
};

const runComparison = () => {
  const leftSideStats = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summary .notification"
  );
  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];
    const rightSideValue = +rightStat.getAttribute("data-value");
    const leftSideValue = +leftStat.getAttribute("data-value");
    if (isNaN(leftSideValue) || isNaN(rightSideValue)) {
      rightStat.classList.replace("is-primary", "is-secondary");
      leftStat.classList.replace("is-primary", "is-secondary");
    } else if (leftSideValue > rightSideValue) {
      rightStat.classList.replace("is-primary", "is-warning");
    } else {
      leftStat.classList.replace("is-primary", "is-warning");
    }
  });
};

export const movieTemplate = (movieDetail) => {
  const boxOfficeCollection =
    movieDetail.BoxOffice === "N/A" || movieDetail.BoxOffice === undefined
      ? "N/A"
      : +movieDetail.BoxOffice.replace(/[\$\,]/g, "");
  const metaScore = +movieDetail.Metascore;
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = +movieDetail.imdbVotes.replace(/,/g, "");
  const awards = movieDetail.Awards.split(" ")
    .filter((word) => Number.isInteger(+word))
    .reduce((acc, curVal) => acc + +curVal, 0);
  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" alt="${movieDetail.Title} image"/>
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>
      <article data-value=${awards} class="notification is-primary">
        <p class="title">${movieDetail.Awards}</p>
        <p class="subtitle">Awards</p>
      </article>
      <article data-value=${boxOfficeCollection} class="notification is-primary">
        <p class="title">${movieDetail.BoxOffice||"N/A"}</p>
        <p class="subtitle">Box Office</p>
      </article>
      <article data-value=${metaScore} class="notification is-primary">
        <p class="title">${movieDetail.Metascore}</p>
        <p class="subtitle">Metascore</p>
      </article>
      <article data-value=${imdbRating} class="notification is-primary">
        <p class="title">${movieDetail.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
      </article>
      <article data-value=${imdbVotes} class="notification is-primary">
        <p class="title">${movieDetail.imdbVotes}</p>
        <p class="subtitle">IMDB Votes</p>
      </article>
    `;
};


//left side auto complete
createAutocomplete({
  root: document.querySelector("#left-autocomplete"),
  ...autocompleteConfig,
  onOptionSelect(movie) {
    //hide the tutorial text
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
});
//right side autocomplete
createAutocomplete({
  root: document.querySelector("#right-autocomplete"),
  ...autocompleteConfig,
  onOptionSelect(movie) {
    //hide the tutorial text
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
});