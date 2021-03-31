if (typeof process.env.PORT !== 'undefined') {
    require('./stub_server'); // only for purposes of heroku
}

const User = require('./models/user');
const Offset = require('./models/offset');
const Record = require('./models/record');

const sequelize = require('./sequelize');
const seeder = require('./seeder');

const fetch = require('node-fetch');

const _dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
_dayjs.extend(utc);

const dayjs = () => _dayjs.utc().add(4, 'hours');


const ms = require('ms');
const token = '1422055904:AAHMVbFbvS17wsxasvKmMPp2kuIGOrwZFJ4';

const log = (...args) => {
    const datetime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    console.log('[' + datetime + ']', ':', ...args);
};


// hello everyone
// today we are going to build a telegram bot which will provide us with covid-19 data every day
// I live in Armenia, and every morning on 11:00 PM our Ministry of Health provides us with
// covid-19 numbers
// and the most interesting numbers for me are: todayCases, todayRecovered, active
// At the beginning I thought I can scrape that numbers from out news sites
// but after I realized that it impossible to not exists  API for it
// I found thi great api, you cant find the link in the description for this video
// The most convenient method for our purpose is https://disease.sh/v3/covid-19/countries/{country}
// which gives covid-19 data for specific country
// ok, most important part of our application found
// and now let's move on to the development itself
// ok let's take a look at the technology stack that we will use for our bot
// we will write our code on javascript
// we will use SQLite as our database
// ok lets create folder for our application
// I will name it or maybe bovid or maybe tovid
// ok and next lets initiate a project
// open the command line in our application folder and run npm init
// fill in out all necessary fields (will be shown on the video)
// as you can see now we have `package.json` file
// and lets install 3 packages that we will use
// run `npm install sqlite3` to install sqlite driver for nodejs
// and `npm install dayjs` which is a module for working with dates
// and lastly `npm install node-fetch` A light-weight module that brings window.fetch to Node.js
// ok lets create our database.
// to be continued...


const getUpdates = async (offset = 0) => {
    const method = 'getUpdates';
    const url = `https://api.telegram.org/bot${token}/${method}`;

    const body = {
        offset,
        timeout: 100,
    };

    try {
        const response = await fetch(url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json'}
        });

        if (response.ok) {
            const responseBody = await response.json();
            log('getUpdates 1', JSON.stringify(responseBody.result, null, '\t'));
            return responseBody.result;
        } else {
            log('getUpdates 2', response.statusText)
            return null;
        }
    } catch (error) {
        log('getUpdates 3', error);
        return null;
    }
};

const fetchUser = message => {
    if ('from' in message) {
        return message.from;
    }

    return null;
};

const fetchMessage = update => {
    if ('message' in update) {
        return update.message;
    }

    return null;
};

const fetchOffset = updates => {
    return updates[updates.length - 1].update_id;
};

const fetchUsers = updates => {
    const users = [];

    for (const update of updates) {
        const message = fetchMessage(update);
        if (!message) continue;

        const user = fetchUser(message);
        if (!user) continue;

        users.push(user);
    }

    return users;
};


const storeUsers = async users => {
    const _users = users.map(user => ({
        tgId: user.id,
        firstName: user.first_name,
    }));

    const result = await User.bulkCreate(_users, {
        ignoreDuplicates: true,
    });

    return result.filter(user => user.getDataValue('id') !== null);
};


const storeRecord = async record => {
    try {
        await Record.create({
            cases: record.todayCases,
            recovered: record.todayRecovered,
            active: record.active,
        });

        return 1;
    } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            return 0;
        }
    }
};

const storeOffset = offset => {
    return Offset.create({
        id: offset,
    });
};

const fetchRecord = async () => {
    const url = 'https://disease.sh/v3/covid-19/countries/AM';
    const params = new URLSearchParams();
    params.set('strict', 'true');
    params.set('allowNull', 'true');

    try {
        const response = await fetch(`${url}?${params}`);

        if (response.ok) {
            return response.json();
        } else {
            log(response.statusText);
            return null;
        }
    } catch (error) {
        log(error);
        return null;
    }

};

const validRecord = record => {
    if (record === null) {
        return false;
    }

    const updated = dayjs(record.updated);
    const today = dayjs();

    if (!updated.isSame(today, 'day')) {
        return false;
    }

    return record.todayCases !== null;
};

const getUsers = async () => {
    const result = await User.findAll({
        attributes: ['tgId'],
    });

    return result.map(user => user.getDataValue('tgId'))
};

const getTodayRecord = () => {
    const now = dayjs().format('YYYY-MM-DD');

    return Record.findOne({
        where: {
            createdAt: now
        },
        attributes: ['cases', 'recovered', 'active'],
    });
}

const notify = users => {
    return getTodayRecord().then(record => {
        if (record === null) {
            return null;
        }

        const message =
            'վարակված։ ' + record.cases + '\n' +
            'առողջացած։ ' + record.recovered + '\n' +
            'փաստացի բուժվող։ ' + record.active;

        const promises = users.map(user => {
            return sendMessage(user, message);
        });

        return Promise.all(promises);
    });
};

const sendMessage = async (chat_id, text) => {
    const method = 'sendMessage';
    const url = `https://api.telegram.org/bot${token}/${method}`;

    const body = {
        chat_id,
        text
    };

    const response = await fetch(url, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    });

    return response.json();
};

const getOffset = async () => {
    const result = await Offset.max('id');
    return isNaN(result) ? null : result;
};

const run = async () => {
    await sequelize.sync();
    await seeder.run();

    processUpdates();
    processRecords();

    console.log(process.env.DATABASE_URL)
};

const processRecords = async () => {
    const now = dayjs();
    const hour = now.hour();

    if (hour < 11) {
        log('hour < 11: next run:', ms(11 - hour + 'h'));
        return setTimeout(processRecords, ms(11 - hour + 'h'));
    }

    const record = await fetchRecord();


    if (!validRecord(record)) {
        log('invalid record: next run:', ms('10m'));
        return setTimeout(processRecords, ms('10m'));
    }

    const changes = await storeRecord(record);

    if (changes > 0) {
        log('new record arrived');
        const usersIds = await getUsers();
        await notify(usersIds);
    }

    const nextRunMS = dayjs().add(1, 'day').startOf('day').add(11, 'hours').diff(now);
    log('users notified: next run:', nextRunMS);
    setTimeout(processRecords, nextRunMS);
};

const processUpdates = async () => {
    let offset = await getOffset();

    if (offset === null) {
        offset = 0;
    }

    const updates = await getUpdates(offset + 1);

    if (updates === null || updates.length === 0) {
        return setTimeout(processUpdates, 10000);
    }

    const users = fetchUsers(updates);
    log('processUpdates', 'fetchUsers', users);
    const newOffset = fetchOffset(updates);

    if (users.length > 0) {
        await storeUsers(users).then(result => {
            log('storeUsers', result);

            const {length: changes} = result;

            if (changes < 1) {
                return;
            }

            return getTodayRecord().then(record => {
                if (!record) {
                    return;
                }

                const userTgIds = result.map(user => user.getDataValue('tgId'));

                return notify(userTgIds).then(messages => {
                    log(messages);
                });
            });
        });
    }

    await storeOffset(newOffset).then(result => {
        log('storeOffset', result);
    });

    setTimeout(processUpdates, 1000);
};

run();

/*

API_URL = https://disease.sh/v3/covid-19/countries/Armenia

Fixed query params:
    strict=true // strict check of country name
    allowNull=true // allows `null` values for unavailable data


Q: where from I should get information about coronavirus numbers in Armenia
A: https://disease.sh/docs

I should store users ids to send them covid data every day
We can store every days covid data for sake of history


and in the end we need to store offset

also we can have a table which will hold data about
which user gets which statistics
that should be a table with two columns: user_id and statistic id





the main flow of the program is as follows:

    1. connect to the db
    2. get the last offset from the db
    3. get all new messages providing last offset
    4. extract all user ids from the new messages
    5. remove all duplicates
    6. insert all new users to database



Table schemas:

    USERS:
        id -> int
        tg_id -> int
        first_name -> text

        country? -> in the future we can support county as our API supports country to provide with data to users from
        other countries, but I think it useless for now


    records:
        id -> auto incrementing integer

        todayCases -> int
        todayRecovered -> int
        active -> int

    @non-actual
    user_record:
        user_id -> int
        record_id -> int





Application events:
    title: NEW USER
    description: when user first time opens conversation with telegram bot, than user considered as new
    handling: if new record for current day exists provide user with that record otherwise send message
        informing that he/she will get data when it will be available

    title: NEW RECORD
    description: when covid-19 data for current day becomes available, then new record is created
    handling: after fetching new record we should add it to database and send that record to all
        existing users

    ...



Application database:
    # .open dbfilename.db
    # .tables
    # .schema table_name // table_name may be pattern

    database: SQLite
    Tables:
        Users:
            Create Code:
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY,
                    tg_id INTEGER UNIQUE NOT NULL,
                    first_name TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
        Records:
            Create Code:
                CREATE TABLE IF NOT EXISTS records (
                    id INTEGER PRIMARY KEY,
                    cases INTEGER NOT NULL,
                    recovered INTEGER NOT NULL,
                    active INTEGER NOT NULL,
                    created_at TEXT UNIQUE NOT NULL
                );

        Offset:
            Create Code:
                CREATE TABLE IF NOT EXISTS offsets (
                    id INTEGER UNIQUE NOT NULL
                );

*/





