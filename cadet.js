
/*
Requirements
*/

var fs = require("fs");
var path = require("path");
var async = require("async");

var argv = require('optimist')
.usage("Clean up unwanted whitespace.\nUsage: $0 <dir>")
.options({
  'e': {
    alias: "ext",
    demand: true,
    desc: "files matching this extension will be checked"
  },
  'v': {
    alias: "verbose",
    default: false,
    desc: "enable verbose output"
  },
  'd': {
    alias: "depth",
    default: 1,
    desc: "filesystem depth to recurse into, use 0 for infinity"
  }
})
.argv;

/*
Global state
*/
var explorationlimit = 5;
var lineSep = "\n";

/*
Explorers
*/

function abortLaunch(err) {
  if (err) {
    console.error("Hit an issue while launching:");
    console.error(err.message);
    console.error();
    process.exit(err.code);
  }
}

function mutations(raw) {
  var rawlines = raw.split(lineSep);
  return rawlines.map(function (line) {
    return line.trimRight();
  }).join(lineSep);
}

function visitSector(location, callback) {
  fs.readdir(location, function (err, files) {
    abortLaunch(err);
    if (argv.verbose) console.log("> " + location);
    async.forEachLimit(files, explorationlimit, function (f, next) {
      // ss = solar system
      var ss = path.join(location, f);
      var info = fs.statSync(ss);
      if (!info.isFile() || path.extname(ss) !== argv.ext) {
        next();
        return;
      }
      fs.readFile(ss, 'utf8', function (err, data) {
        if (err) { next(err); }
        if (argv.verbose) console.log(". " + ss);
        var clean = mutations( String(data) );
        fs.writeFile(ss, clean, 'utf8', function (err) {
          if (err) { next(err); }
          next();
        });
      });
    }, function (err) {
      callback(err);
    });
  });
}

function blastOff() {
  var launchpad, sector;
  if (argv._.length) {
    launchpad = argv._[0];
  } else {
    launchpad = ".";
  }
  if (argv.ext[0] !== '.') {
    argv.ext = "." + argv.ext.trim();
  }
  var lightyears = 1;
  sectors = [ launchpad ];
  async.whilst(
    function () { return argv.depth === 0 || lightyears <= argv.depth; },
    function (next) {
      toexplore = [];
      async.forEachSeries(
        sectors,
        function (sector, nextSector) {
          visitSector(sector, function (err) {
            if (err) { nextSector(err); }
            fs.readdir(sector, function (err, files) {
              if (err) { nextSector(err); }
              toexplore.push.apply(toexplore, files.filter(function (f) {
                // gal = galaxy
                var gal = path.join(sector, f);
                var info = fs.statSync(gal);
                return info.isDirectory();
              }).map(function (f) {
                return path.join(sector, f);
              }));
              nextSector();
            });
          });
        },
        function (err) {
          if (err) { next(err); }
          lightyears++;
          sectors = toexplore;
          next();
        }
      );
    },
    function (err) {
      abortLaunch(err);
      if (argv.verbose) console.log("---");
    }
  );
}

if (require.main == module) {
  blastOff();
}
