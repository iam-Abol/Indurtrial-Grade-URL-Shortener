import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // warm up
    { duration: '1m', target: 300 }, // load
    { duration: '1m', target: 500 }, // stress
    { duration: '30s', target: 0 }, // cool down
  ],
};

export default function () {
  const url = 'http://localhost:3000/6';

  const res = http.get(url, {
    redirects: 0,
  });

  check(res, {
    'status is 302': (r) => r.status === 302,
  });
  if (res.status !== 302) {
    console.log(res.status);
  }
  //   sleep(1);
}
