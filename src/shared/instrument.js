export default function instrument(shipit, task, name) {
  return () => {
    const startAt = new Date();
    return task().then(() => {
      return shipit.log(`${name} completed in ${startAt - new Date()}`);
    });
  };
}
