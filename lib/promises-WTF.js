const p1 = new Promise(function(resolve, reject) {
  resolve(1);
});

const p2 = new Promise(function(resolve, reject) {
  reject('2xx');
});

const p3 = new Promise(function(resolve, reject) {
  resolve(3);
});


p1
.then((val) => {
  console.log('in then of p1. val: ', val);
  return p2;
})
.then((val) => {
  console.log('in then of p2. val: ', val);
  return p3;
}, (reject_val) => {
  console.log('in catch of p2. val: ', reject_val);
  return p3;
})
.then((val) => {
  console.log('in then of p3. val: ', val);
});