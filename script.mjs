import puppeteer from 'puppeteer-core';
import inquirer from 'inquirer';
import chalk from 'chalk';
// CONFIG

const info = {
    prefix: "Mr.", 
    surName: "YIFAN",
    lastName: "YUAN",
    tel: '18810187168',
    email: 'moshian90s@gmail.com',
    country: '中國',
    address1: '安徽省 合肥市 瑶海区',
    cardNum: '0000 0000 0000', // 选择信用卡支付，会出现此信息输入要求
    expire: '09/07', // 选择信用卡支付，会出现此信息输入要求
    cvv: '213', // 选择信用卡支付，会出现此信息输入要求
    cardHolder: 'YIFAN YUAN', // 选择信用卡支付，会出现此信息输入要求
}

const config = {
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    auto_close: true,
    musicRequestPath: `https://taira-komori.jpn.org/sound_os/daily01/knocking_an_iron_door4.mp3`,
    default_parameter: {
        arrive: '07-20',
        depart: '07-23',
        days: 7,
        payment: 3,
    },
}

// MAIN LOGIC BELOW

let browser = null;
let context = null;

entry();

async function clerk(cur) {
    await Promise.all([
        cur.waitForNavigation({ waitUntil: "networkidle2" }),
        cur.click("#auto-child-card-QUARANTINE7_ASD0 > div > div.thumb-cards_details > div > div.thumb-cards_right > div.thumb-cards_button > button"),
    ]);

    const clickLists = [
        `#reservation1GuestInfo > div > div.guest-payment_container > fieldset > div > div:nth-child(${config.default_parameter.payment}) > div.payment-radio-button_header > input[type=radio]`,
        "#privacyPolicy",
        "#policyAcknowledgement",
    ]

    for (let e of clickLists) {
        await cur.waitForSelector(e);
    }

    await cur.evaluate(async lists => {
        for (let e of lists) {
            await document.querySelector(e).click();
        }
    }, clickLists);

    const inputLists = [
        [info.surName, "#reservation1GuestInfo > div > div.guest-info_contactInfo > fieldset > div.guest-info_prefixNameGroup > div.guest-info_firstNameField.input-field_container > label > input[type=text]"],
        [info.lastName, "#reservation1GuestInfo > div > div.guest-info_contactInfo > fieldset > div.guest-info_lastNameField.input-field_container > label > input[type=text]"],
        [info.tel, "#reservation1GuestInfo > div > div.guest-info_contactInfo > fieldset > div.guest-info_phoneNumberField.input-field_container > label > input[type=tel]"],
        [info.email, "#reservation1GuestInfo > div > div.guest-info_contactInfo > fieldset > div.guest-info_emailAddressFieldGroup > div > label > input[type=email]"],
        [info.country, "#reservation1GuestInfo > div > div.address-details_addressInfo > fieldset > div.address-details_countryField.input-autocomplete_container > div > label > input[type=text]"],
        [info.address1, "#reservation1GuestInfo > div > div.address-details_addressInfo > fieldset > div.address-details_addressFields > div > label > input[type=text]"],
    ]

    const cardSelector = [
        [info.cardNum, "#reservation1GuestInfo > div > div.guest-payment_container > fieldset > div > div:nth-child(1) > div.payment-radio-button_content > div > div.guest-payment-create_cardNumberField.input-field_container.input-field_withIconLeft > label > input[type=text]"],
        [info.expire, "#reservation1GuestInfo > div > div.guest-payment_container > fieldset > div > div:nth-child(1) > div.payment-radio-button_content > div > div.guest-payment-create_expDateField.input-field_container > label > input[type=text]"],
        [info.cvv, "#reservation1GuestInfo > div > div.guest-payment_container > fieldset > div > div:nth-child(1) > div.payment-radio-button_content > div > div.payment-cvv-field_cvvField.input-field_container.input-field_withIconRight > label > input[type=text]"],
        [info.cardHolder, "#reservation1GuestInfo > div > div.guest-payment_container > fieldset > div > div:nth-child(1) > div.payment-radio-button_content > div > div.guest-payment-create_nameField.input-field_container > label > input[type=text]"],
    ]

    if (config.payment == 1) inputLists = inputLists.concat(cardSelector);

    // prefix
    await cur.waitForSelector("#reservation1GuestInfo > div > div.guest-info_contactInfo > fieldset > div.guest-info_prefixNameGroup > div.guest-info_prefixField > div.select_container > select");
    await cur.select("#reservation1GuestInfo > div > div.guest-info_contactInfo > fieldset > div.guest-info_prefixNameGroup > div.guest-info_prefixField > div.select_container > select", info.prefix);

    for (let e of inputLists) {
        await cur.waitForSelector(e[1]);
        await cur.type(e[1], e[0]);
    }

    await cur.click("#mainContent > div.guest-info-container_bottomContinue.button_group > button")
}

async function getter(iter, adult = 1, arrive, depart, rooms = 1, isAlarm = true) {
    let data, now = (new Date);
    const page = await browser.newPage();

    try {
        await page.goto(`https://be.synxis.com/?adult=${adult}&arrive=2022-${arrive}&chain=21619&child=0&currency=HKD&depart=2022-${depart}&hotel=76640&level=hotel&locale=zh-TW&rooms=${rooms}`, { waitUntil: "networkidle2" });

        data = await page.evaluate(async (arrive, depart) => {
            if (!!document.querySelector("#auto-child-card-QUARANTINE7_ASD0 > div > div.thumb-cards_details > div > div.thumb-cards_right > div.thumb-cards_button > button")) {
                await (new Audio("https://taira-komori.jpn.org/sound_os/daily01/knocking_an_iron_door4.mp3")).play();
                new Notification('九龙酒店 说', {
                    body: `恭喜您，可以隔离啦！\n到店：${arrive} 离店：${depart}\n 正在准备付款`,
                })

                return Promise.resolve(true);
            } else {
                return Promise.resolve(false);
            }
        }, arrive, depart);

        if (!!data) clerk(page);

        console.log(`现在是 ${(now).getHours()}点${(now).getMinutes()}分 第${iter}輪嘗試 ⏱️`)
        console.log(chalk[!!data ? "green" : "red"](`Arrive: ${arrive} Depart: ${depart}`, `Behavior: ${data} ${!!data ? "✅" : "❌"}`));
    } catch (e) {
        if (e instanceof puppeteer.errors.TimeoutError) {
            new Notification('九龙酒店 说', {
                body: `出现超时错误，正在重试`,
            })
            console.log('request timeout');
        }
        console.log(e);
        await page.close();
        return { flag: false, info: e };
    }

    if (!data) await page.close();

    return { flag: data, info: null };
}

async function main(start, end, days, iter = 1, duration = 3) {
    let success = false, cursor = new Date(`2022-${start}`), errorinfo = null;
    end = new Date(`2022-${end}`);
    while (format(cursor) !== format(new Date(end.getTime() + 1000 * 3600 * 24))) {
        let depart = new Date(cursor.getTime() + 1000 * 3600 * 24 * days);
        ({ flag: success, info: errorinfo } = await getter(iter, 1, format(cursor), format(depart)));
        if (!!success && !!config.auto_close) break;
        if (!success && !!errorinfo) continue;
        cursor = new Date(cursor.getTime() + 3600 * 1000 * 24);
    }
    if (success && config.auto_close) {
        console.log( chalk.yellowBright(`我滴任务完成啦`) );
        return;
    }
    await new Promise(resolve => {
        setTimeout(resolve, duration * 1000);
    })
    return main(start, format(end), days, ++iter, duration);
}

function format(date) {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

async function entry() {
    let cache = new Array;

    let questions = [
        {
            type: 'input',
            name: 'start',
            message: "輸入搜尋的開始日期?（e.g.07-01）",
            validate: function (s) {
                const done = this.async();
                let pattern = /\d{2}-\d{2}/g;
                if ((pattern.test(s) && s.match(pattern).length == 1) || !s) {
                    cache.push(s);
                    done(null, true);
                } else {
                    done('格式錯了');
                    return false;
                }
            },
            default: config.default_parameter.arrive
        },
        {
            type: 'input',
            name: 'end',
            message: "輸入搜尋的結束日期?（e.g.07-01）",
            validate: function (s) {
                const done = this.async();
                let pattern = /\d{2}-\d{2}/g;
                if ((new Date(`2022-${cache[0]}`)).getTime() > (new Date(`2022-${s}`)).getTime()) {
                    done('起始日期在結束日期后');
                    return false;
                }
                if (!((pattern.test(s) && s.match(pattern).length == 1) || !s)) {
                    done('格式錯了');
                    return false;
                }
                done(null, true);
                return true;
            },
            default: config.default_parameter.depart
        },
        {
            type: 'input',
            name: 'days',
            message: "在酒店所待日長?（e.g.7）",
            validate: function (d) {
                const done = this.async();
                if (!!d && d < 1) {
                    done('輸入大於0的數字');
                    return false;
                }
                done(null, true);
                return true;
            },
            default: config.default_parameter.days
        }, {
            type: 'list',
            name: 'payment',
            message: '選擇付款方式',
            choices: [
                { name: '💳 信用卡支付', value: 1 },
                { name: '💲 銀聯', value: 2 },
                { name: '🅰️ 支付寶（默認）', value: 3},
            ],
            default: 2
        }
    ];

    let args = new Array;

    await inquirer.prompt(questions).then(answers => {
        args.push(!answers['start'] ? config.default_parameter.arrive : answers['start']);
        args.push(!answers['end'] ? config.default_parameter.depart : answers['end']);
        args.push((!answers['days']) ? config.default_parameter.days : answers['days']);
        config.default_parameter.payment = answers['payment'];
    })

    browser = await puppeteer.launch({
        headless: false,
        executablePath: config.executablePath
    });
    
    context = browser.defaultBrowserContext();
    await context.overridePermissions('https://be.synxis.com/', ['notifications']);
    return main(...args);
}

