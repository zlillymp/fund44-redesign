import { home } from './home.js';
import { financing } from './financing.js';
import { sba7a, sba504, acquisition, workingCapital } from './products.js';
import { howItWorks } from './how-it-works.js';
import { about } from './about.js';
import { resources, article } from './resources.js';
import { privacy, terms, contact } from './legal.js';
import { notFound } from './not-found.js';

export const routes = {
  '/': home,
  '/financing': financing,
  '/sba-7a': sba7a,
  '/sba-504': sba504,
  '/business-acquisition': acquisition,
  '/working-capital': workingCapital,
  '/how-it-works': howItWorks,
  '/about': about,
  '/resources': resources,
  '/resources/:slug': article,
  '/privacy': privacy,
  '/terms': terms,
  '/contact': contact,
  '*': notFound,
};
