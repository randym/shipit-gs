import rollback from '../rollback';
import deploy from '../deploy';
import ShipitGS from '../shipit-gs';

jest.mock('../deploy');
jest.mock('../rollback');

describe('deploy', () => {
  const shipit = {};

  beforeAll(() => {
    ShipitGS(shipit);
  });

  afterAll(() => {
    jest.unmock('../deploy');
    jest.unmock('../rollback');
  });

  test('deploy with shipit', () => {
    expect(rollback.mock.calls[0][0]).toEqual(shipit);
  });

  test('rollback with shipit', () => {
    expect(deploy.mock.calls[0][0]).toEqual(shipit);
  });
});

