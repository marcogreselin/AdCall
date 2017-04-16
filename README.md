# AdCall
Bringing WebRTC into display advertising. Because landing pages often don't lead to conversions, it would be much better to be able to call the advertiser within the banner. A few notes:

- A video intro and demo is available on [YouTube](https://youtu.be/3ZDOA5haCeY).
- The live demo is available at this addres: https://adcall.io/ (un/pw: adcall). Make sure you disable your adblocker.
- Finally, a comprehensive report of all the features is available [here](https://s3-eu-west-1.amazonaws.com/marcogreselin/adcall.pdf).

## How to run it
Well you can't. You could if you knew the environment variables which are recorded within the Heroku environment. But you don't. Every time you see `process.env.` that's an environment variable. They are stored within Heroku so that I can share this here safely.

More on the environment variables used on page 62 of the [report](https://s3-eu-west-1.amazonaws.com/marcogreselin/adcall.pdf).

## Features implemented
1. Users can register either as advertisers or as publishers and there is one admin for each company. I used [Passport](http://passportjs.org/) to handle that.
2. I used PostegreSQL as underlying database and the brilliant `pg-promise` to connect with it.
3. [SympleWebRTC](https://simplewebrtc.com/) and [Socket.IO](https://socket.io/) are used to manage the WebRTC interactions.
4. Because of the nature of Heroku's dynos (more [here](https://devcenter.heroku.com/articles/dynos)), I used S3 to store images.
