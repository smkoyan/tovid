const User = require('./models/user');
const Record = require('./models/record');
const Offset = require('./models/offset');

const seedUsers = async () => {
    const users = [{ "id": 1, "tgId": 1312472724, "firstName": "Sargis", "createdAt": "2020-12-12" }, { "id": 2, "tgId": 619822110, "firstName": "Samvel", "createdAt": "2020-12-12" }, { "id": 3, "tgId": 532540920, "firstName": "Kost", "createdAt": "2020-12-12" }, { "id": 4, "tgId": 478767433, "firstName": "Andranik", "createdAt": "2020-12-12" }, { "id": 5, "tgId": 1340915505, "firstName": "Hasmik", "createdAt": "2020-12-13" }, { "id": 6, "tgId": 1113481240, "firstName": "Yeranuhi", "createdAt": "2020-12-14" }, { "id": 7, "tgId": 1327862697, "firstName": "Tatevik", "createdAt": "2020-12-14" }, { "id": 8, "tgId": 557912092, "firstName": "Գեղամ", "createdAt": "2020-12-15" }, { "id": 9, "tgId": 576926336, "firstName": "Sergey", "createdAt": "2020-12-29" }]

    await User.bulkCreate(users, {
        ignoreDuplicates: true,
    });
};

const seedRecords = async () => {
    const records = [{ "id": 1, "cases": 995, "recovered": 1047, "active": 20329, "createdAt": "2020-12-12" }, { "id": 2, "cases": 1013, "recovered": 648, "active": 20670, "createdAt": "2020-12-13" }, { "id": 3, "cases": 357, "recovered": 797, "active": 20213, "createdAt": "2020-12-14" }, { "id": 4, "cases": 438, "recovered": 1486, "active": 19139, "createdAt": "2020-12-15" }, { "id": 5, "cases": 1098, "recovered": 1242, "active": 18968, "createdAt": "2020-12-16" }, { "id": 6, "cases": 1174, "recovered": 1296, "active": 18821, "createdAt": "2020-12-17" }, { "id": 7, "cases": 861, "recovered": 1223, "active": 18444, "createdAt": "2020-12-18" }, { "id": 8, "cases": 920, "recovered": 718, "active": 18626, "createdAt": "2020-12-19" }, { "id": 9, "cases": 240, "recovered": 644, "active": 18233, "createdAt": "2020-12-21" }, { "id": 10, "cases": 537, "recovered": 1410, "active": 17343, "createdAt": "2020-12-22" }, { "id": 11, "cases": 838, "recovered": 1052, "active": 17111, "createdAt": "2020-12-23" }, { "id": 12, "cases": 702, "recovered": 1128, "active": 16662, "createdAt": "2020-12-24" }, { "id": 13, "cases": 621, "recovered": 1049, "active": 16215, "createdAt": "2020-12-25" }, { "id": 14, "cases": 586, "recovered": 854, "active": 15928, "createdAt": "2020-12-26" }, { "id": 15, "cases": 485, "recovered": 444, "active": 15953, "createdAt": "2020-12-27" }, { "id": 16, "cases": 114, "recovered": 562, "active": 15498, "createdAt": "2020-12-28" }, { "id": 17, "cases": 348, "recovered": 1267, "active": 14557, "createdAt": "2020-12-29" }, { "id": 18, "cases": 582, "recovered": 902, "active": 14227, "createdAt": "2020-12-30" }, { "id": 19, "cases": 60, "recovered": 285, "active": 13322, "createdAt": "2021-01-02" }, { "id": 20, "cases": 361, "recovered": 573, "active": 10546, "createdAt": "2021-01-08" }, { "id": 21, "cases": 157, "recovered": 561, "active": 9484, "createdAt": "2021-01-11" }, { "id": 22, "cases": 355, "recovered": 729, "active": 9100, "createdAt": "2021-01-12" }, { "id": 23, "cases": 485, "recovered": 644, "active": 8931, "createdAt": "2021-01-13" }, { "id": 24, "cases": 448, "recovered": 603, "active": 8764, "createdAt": "2021-01-14" }, { "id": 25, "cases": 396, "recovered": 471, "active": 8678, "createdAt": "2021-01-15" }, { "id": 26, "cases": 90, "recovered": 292, "active": 8614, "createdAt": "2021-01-18" }, { "id": 27, "cases": 236, "recovered": 436, "active": 8405, "createdAt": "2021-01-19" }, { "id": 28, "cases": 138, "recovered": 472, "active": 7776, "createdAt": "2021-01-26" }, { "id": 29, "cases": 62, "recovered": 281, "active": 6204, "createdAt": "2021-02-01" }, { "id": 30, "cases": 190, "recovered": 358, "active": 5639, "createdAt": "2021-02-03" }, { "id": 31, "cases": 123, "recovered": 293, "active": 5005, "createdAt": "2021-02-09" }, { "id": 32, "cases": 442, "recovered": 378, "active": 6071, "createdAt": "2021-03-05" }, { "id": 33, "cases": 748, "recovered": 182, "active": 7606, "createdAt": "2021-03-11" }, { "id": 34, "cases": 818, "recovered": 277, "active": 8143, "createdAt": "2021-03-12" }, { "id": 35, "cases": 486, "recovered": 205, "active": 8950, "createdAt": "2021-03-14" }, { "id": 36, "cases": 317, "recovered": 230, "active": 9027, "createdAt": "2021-03-15" }, { "id": 37, "cases": 585, "recovered": 292, "active": 9308, "createdAt": "2021-03-16" }, { "id": 38, "cases": 854, "recovered": 211, "active": 9946, "createdAt": "2021-03-17" }, { "id": 39, "cases": 1024, "recovered": 273, "active": 10678, "createdAt": "2021-03-18" }, { "id": 40, "cases": 891, "recovered": 332, "active": 11218, "createdAt": "2021-03-19" }, { "id": 41, "cases": 1071, "recovered": 459, "active": 11818, "createdAt": "2021-03-20" }, { "id": 42, "cases": 506, "recovered": 432, "active": 12138, "createdAt": "2021-03-22" }];

    await Record.bulkCreate(records, {
        ignoreDuplicates: true,
    });
}


const seedOffsets = async () => {
    const offsets = [{ "id": 638016661 }, { "id": 638016662 }, { "id": 638016663 }, { "id": 638016664 }, { "id": 638016665 }, { "id": 638016666 }, { "id": 638016667 }, { "id": 638016668 }, { "id": 638016669 }, { "id": 638016670 }, { "id": 638016671 }, { "id": 638016672 }, { "id": 638016673 }, { "id": 638016674 }, { "id": 638016675 }, { "id": 638016676 }, { "id": 638016677 }, { "id": 638016678 }, { "id": 638016679 }, { "id": 638016680 }, { "id": 638016681 }, { "id": 638016682 }, { "id": 638016683 }, { "id": 638016684 }, { "id": 638016685 }, { "id": 638016686 }, { "id": 638016687 }, { "id": 638016688 }, { "id": 638016689 }, { "id": 638016690 }, { "id": 638016693 }, { "id": 638016694 }];

    await Offset.bulkCreate(offsets, {
        ignoreDuplicates: true,
    });
}

exports.run = async () => {
    await seedUsers();
    await seedRecords();
    await seedOffsets();
};

