import deploy from './deploy';
import rollback from './rollback';

export default function ShipitGs(shipit) {
  deploy(shipit);
  rollback(shipit);
}

