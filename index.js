if (typeof process.env.PORT !== 'undefined') {
    require('./stub_server'); // only for purposes of heroku
}

const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose(); // Sets the execution mode to verbose to produce long stack traces

const _dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
_dayjs.extend(utc);

const dayjs = () => _dayjs.utc().add(4, 'hours');


const ms = require('ms');
const token = '1422055904:AAHMVbFbvS17wsxasvKmMPp2kuIGOrwZFJ4';

const db_filename = 'db';

const db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, err => {
    if (err) {
        return console.error(err.message);
    }

    console.log('Successfully connected to the database');
});

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
            log(JSON.stringify(responseBody.result, null, '\t'));
            return responseBody.result;
        } else {
            log(response.statusText)
            return null;
        }
    } catch (error) {
        log(error);
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

const storeUsers = users => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT OR IGNORE INTO users (tg_id, first_name, created_at) VALUES ' + '(? , ?, DATE()),'.repeat(users.length).slice(0, -1);
        const params = users.map(user => [user.id, user.first_name]).flat();

        db.run(query, params, function (error) {
            if (error) {
                reject(error);
            } else {
                resolve(this);
            }
        });
    });
};

const storeRecord = record => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT OR IGNORE INTO records (cases, recovered, active, created_at) values (?, ?, ?, DATE())';
        const params = [record.todayCases, record.todayRecovered, record.active];

        db.run(query, params, function (error) {
            if (error) {
                reject(error);
            } else {
                resolve(this);
            }
        });
    });
};

const storeOffset = offset => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO offsets (id) VALUES (?)';

        db.run(query, offset, function (error) {
            if (error) {
                reject(error);
            } else {
                resolve(this);
            }
        });
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

    if (! updated.isSame(today, 'day')) {
        return false;
    }

    return record.todayCases !== null;
};

const getUsers = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT tg_id FROM users';

        db.all(query, (error, rows) => {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
            }
        });
    });
};

const getLastRecord = () => {
    return new Promise((resolve, reject) => {
        // const query = 'SELECT cases, recovered, active FROM records WHERE id = (SELECT MAX(id) FROM records)';
        const query = 'SELECT cases, recovered, active FROM records WHERE created_at = ?';
        const now = dayjs().format('YYYY-MM-DD');

        db.get(query, now, (error, row) => {
            if (error) {
                reject(error);
            } else {
                resolve(row);
            }
        });
    });
};

const getTodayRecord = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT cases, recovered, active FROM records WHERE created_at = ?';
        const now = dayjs().format('YYYY-MM-DD');

        db.get(query, now, (error, row) => {
            if (error) {
                reject(error);
            } else {
                resolve(row);
            }
        });
    });
}

const notify = users => {
    return getLastRecord().then(record => {
        if (typeof record === 'undefined') {
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

const getOffset = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT MAX(id) AS offset FROM offsets';

        db.get(query, (error, row) => {
            if (error) {
                reject(error);
            } else {
                resolve(row.offset);
            }
        });
    });
};

const getLastNUsers = n => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT tg_id FROM users ORDER BY id DESC LIMIT ' + n;

        db.all(query, (error, rows) => {
            if (error) {
                reject(error);
            } else {
                resolve(rows.map(r => r.tg_id));
            }
        });
    });
};

const run = async () => {
    processUpdates();
    processRecords();
};

const processRecords = async () => {
    const now = dayjs();
    const hour = now.hour();

    if (hour < 11) {
        log('hour < 11: next run:', ms(11 - hour + 'h'));
        return setTimeout(processRecords, ms(11 - hour + 'h'));
    }

    const record = await fetchRecord();


    if (! validRecord(record)) {
        log('invalid record: next run:', ms('10m'));
        return setTimeout(processRecords, ms('10m'));
    }

    const { changes } = await storeRecord(record);

    if (changes > 0) {
        log('new record arrived');
        const users = await getUsers();
        const usersIds = users.map(u => u.tg_id);
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
    const newOffset = fetchOffset(updates);

    if (users.length > 0) {
    	await storeUsers(users).then(context => {
	        console.log('storeUsers', context);

	        const { changes } = context;

	        if (changes < 1) {
	            return;
	        }

	        return getTodayRecord().then(record => {
	            if (!record) {
	                return;
	            }

	            return getLastNUsers(changes).then(users => {
	                return notify(users);
	            }).then(messages => {
	                console.log(messages);
	            });
	        });
	    });
    }

    await storeOffset(newOffset).then(context => {
        console.log('storeOffset', context);
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





