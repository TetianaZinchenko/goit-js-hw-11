import './css/styles.css';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { Notify } from 'notiflix/build/notiflix-notify-aio';

import { picturesApi } from './fetchImages';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};

const simpleligthbox = new SimpleLightbox('.gallery a', { loop: false });

const perPage = 40;
let page = 1;
let observer = null;
const options = {
  root: null,
  rootMargin: '600px',
  threshold: 1.0,
};

refs.searchForm.addEventListener('submit', onSearch);

function onSearch(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  if (page > 1) {
    observer.unobserve(refs.guard);
  }
  page = 1;

  const searchQuery = e.target.elements.searchQuery.value.trim();
  observer = new IntersectionObserver(onLoad, options);
  observer.observe(refs.guard);

  function onLoad(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        picturesApi(searchQuery, page, perPage)
          .then(resp => {
            if (resp.data.hits.length < 1) {
              throw new Error();
            }
            addMoreImages(resp.data.hits);
            if (page > 1) {
              smoothScroll();
            }
            if (page === 1) {
              notifySuccess(resp);
            }
            if (page === Math.ceil(resp.data.totalHits / perPage)) {
              observer.unobserve(refs.guard);
              window.addEventListener('scroll', scrollPosition);
            }
            changeOpacity();
            page += 1;
          })
          .catch(error => {
            notifyFailure();
            observer.unobserve(refs.guard);
          })
          .then(() => simpleligthbox.refresh());
      }
    });
  }
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card"><div class="container"><a class="gallery-item" href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" /></a></div>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            <span>${likes}</span>
          </p>
          <p class="info-item">
            <b>Views</b>
            <span>${views}</span>
          </p>
          <p class="info-item">
            <b>Comments</b>
            <span>${comments}</span>
          </p>
          <p class="info-item">
            <b>Downloads</b>
            <span>${downloads}</span>
          </p>
        </div>
      </div>`
    )
    .join('');
}

function scrollPosition() {
  if (window.scrollY > window.innerHeight - 70) {
    window.removeEventListener('scroll', scrollPosition);
    notifyInfo();
  }
}

function addMoreImages(arr) {
  refs.gallery.insertAdjacentHTML('beforeend', createMarkup(arr));
}

function smoothScroll() {
  const { height: cardHeight } =
    refs.gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function changeOpacity() {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
      refs.searchForm.classList.add('is-scrolled');
    } else {
      refs.searchForm.classList.remove('is-scrolled');
    }
  });
}

function notifySuccess(resp) {
  Notify.success(
    `Hooray! We found: ${resp.data.total} images, available for display: ${resp.data.totalHits} images.`
  );
}

function notifyFailure() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function notifyInfo() {
  Notify.info("We're sorry, but you've reached the end of search results");
}
