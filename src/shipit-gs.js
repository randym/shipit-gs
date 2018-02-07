import deploy from './deploy';
import rollback from './rollback';

/**
 * initializes gs-rollback and gs-deploy tasks.
 * @param {Object} shipit An instance of shipit
 */
export default function ShipitGs(shipit) {
  deploy(shipit);
  rollback(shipit);
}

