const chalk = require('chalk');
const hr_line = chalk.magenta('=================================================================================');

const Ok = (...message) => {
  console.log(
    chalk.bold.magenta('[ A-Frame ]'),
    chalk.bold.green("\u2714"),
    chalk.bold.white(message)
  );
};

const Error = (...message) => {
  console.error(
    chalk.bold.magenta('[ A-Frame ] '),
    chalk.bold.red("\u2718"),
    chalk.bold.white(message)
  );
};

const Info = (...message) => {
  console.info(
    chalk.bold.magenta('[ A-Frame ]'),
    chalk.bold.blue("\u26A0"),
    chalk.bold.white(message)
  );
};

const Warning = (...message) => {
  console.warn(
    chalk.bold.magenta('[ A-Frame ]'),
    chalk.bold.yellow("\u26A0"),
    chalk.bold.white(message)
  );
};

const Debug = (...message) => {
  console.log(
    chalk.bold.magenta('[ A-Frame ]'),
    chalk.bold.gray("\u2699"),
    chalk.bold(message)
  );
};

const Hr = () => {
  console.log(hr_line);
};

export default {
  error: Error,
  info: Info,
  warning: Warning,
  ok: Ok,
  debug: Debug,
  hr: Hr,
  banner: port => {
    Hr();
    Ok('A-Frame Development Server started.');
    Info('Open your browser:');
    Info(`http://localhost:${port}`);
    Debug(`Press ${chalk.italic('CTRL-C')} to stop`);
  },
};
