import rollback from '../rollback';
import deploy from '../deploy';
import gcloud from '../gcloud';
import ShipitGS from '../shipit-gs';

jest.mock('../deploy');
jest.mock('../rollback');
jest.mock('../gcloud');

describe('deploy', () => {
  const shipit = {};

  beforeAll(() => {
    ShipitGS(shipit);
  });

  afterAll(() => {
    jest.unmock('../deploy');
    jest.unmock('../rollback');
    jest.unmock('../gcloud');
  });

  test('deploy with shipit', () => {
    expect(rollback.mock.calls[0][0]).toEqual(shipit);
  });

  test('rollback with shipit', () => {
    expect(deploy.mock.calls[0][0]).toEqual(shipit);
  });

  test('rollback with shipit', () => {
    expect(gcloud.mock.calls[0][0]).toEqual(shipit);
  });
});

