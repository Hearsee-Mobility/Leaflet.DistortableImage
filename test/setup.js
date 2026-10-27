import {chai} from 'vitest';
import '../src/index.ts';

/*
 * Asserts that two latlngs are close.
 * For example:
 *     > expect(L.latLng(0, 0.00005)).to.be.closeToLatLng(L.latLng(0, 0))
 *     > true
 */
chai.use(function(chai, utils) {
  const Assertion = chai.Assertion;
  Assertion.addMethod('closeToLatLng', function(expected, delta, message) {
    const actual = utils.flag(this, 'object');

    delta = delta || 1e-4;

    new Assertion(actual).to.have.property('lat');
    new Assertion(actual).to.have.property('lng');

    const latitude = new Assertion(actual.lat);
    const longitude = new Assertion(actual.lng);

    utils.transferFlags(this, latitude, false);
    utils.transferFlags(this, longitude, false);

    latitude.to.be.closeTo(expected.lat, delta, message);
    longitude.to.be.closeTo(expected.lng, delta, message);
  });
});
