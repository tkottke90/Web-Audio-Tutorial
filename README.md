# [One Day Build] Web Audio API Example

I was curious about processing audio using Javascript and found the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).  I spent one day reading and following tutorials and documentation to get a small bit of experience with the API.

This project will let you load a song from your local machine and play it in the browser.  The player includes controls to start, pause, and seek, change the gain (not volume), pan across the two stereo channels, and add distortion to the track.  

In addition the project will show 2 visualizations.  The first is a bar graph showing the decibels of various frequencies.  The second is a line of boxes that use the HSL color system to display various intensities of sounds at different frequencies.  I imagined that this might be an emulation of what an external LED driver might look like.

## Setup

This project was built using 2 external packages (1 for development and one leverage the new file APIs coming to modern browsers).

To run this locally, run `npm install` to get _http-server_ which will serve the static files.

Then to start the web server run:

```bash
npm run start:player
```