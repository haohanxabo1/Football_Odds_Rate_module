const axios = require('axios');
const { DateTime } = require('luxon');

const api_key = "69370b5b6ce14f838d844121309093c9 ";

class Odds {
    constructor(data) {
        this.data = data;
        this.date = this.getDate();
        this.hour = this.getHour();
        this.home_team = data.home_team;
        this.away_team = data.away_team;
        this.home_odds = data.bookmakers[0].markets[0].outcomes[0].price;
        this.away_odds = data.bookmakers[0].markets[0].outcomes[1].price;
        this.draw_odds = data.bookmakers[0].markets[0].outcomes[2].price;
    }

    toString() {
        let string = `${this.home_team} vs ${this.away_team} |\n`;
        string += `1x2 :  1(${this.home_odds})  -- X(${this.draw_odds}) -- 2(${this.away_odds})\n`;
        return string;
    }

    getDate() {
        const commence_time = DateTime.fromISO(this.data.commence_time);
        return commence_time.toLocaleString(DateTime.DATETIME_SHORT);
    }

    getHour() {
        const commence_time = DateTime.fromISO(this.data.commence_time);
        return commence_time.toLocaleString(DateTime.TIME_SIMPLE);
    }
}

const fetchAndParseOdds = async (sport, league) => {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds?regions=eu&markets=spreads&apiKey=${api_key}`;
    
    try {
        const response = await axios.get(url);
        const data = response.data;
        
        let result = '';
        for (const event of data) {
            for (const bookmaker of event.bookmakers) {
                if (bookmaker.key === "onexbet") {
                    const outcomes = bookmaker.markets[0].outcomes;
                    const outcomes_str = outcomes.map(outcome => `${outcome.name} ${outcome.point} ${outcome.price}`).join(' | ');
                    result += `Match: ${event.home_team} vs ${event.away_team}\nRates: ${outcomes_str}\n------------------------\n`;
                }
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('Lỗi !!!!!!!!!!!!!', error);
        return 'Lỗi !!!!!!!!!!!!!';
    }
};

const fetchAndParseTotals = async (sport, league, num_events = 5) => {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds?regions=eu&apiKey=${api_key}&markets=totals`;
    
    try {
        const response = await axios.get(url);
        const data = response.data;
        
        let events_count = 0;
        let result = '';
        for (const event of data) {
            if (events_count >= num_events) {
                break;
            }
            
            let valid_event = false;
            for (const bookmaker of event.bookmakers) {
                if (bookmaker.key === "onexbet") {
                    for (const market of bookmaker.markets) {
                        if (market.key === "totals") {
                            const over_info = market.outcomes.find(outcome => outcome.name === "Over");
                            const under_info = market.outcomes.find(outcome => outcome.name === "Under");
                            
                            if (over_info && under_info) {
                                result += `${event.home_team} - ${event.away_team} | Over - ${over_info.point} - ${over_info.price} | Under - ${under_info.point} - ${under_info.price}\n------------------------\n`;
                                valid_event = true;
                                events_count++;
                                break;
                            }
                        }
                    }
                }
                if (valid_event) {
                    break;
                }
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('Lỗi !!!!!!!!!!!!!', error);
        return 'Lỗi !!!!!!!!!!!!!';
    }
};

const getOddsByLeague = async (sport, league) => {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds?regions=eu&apiKey=${api_key}`;
    const data = [];
    
    try {
        const response = await axios.get(url);
        const content = response.data;
        
        const current_date = DateTime.now();
        const date_limit = current_date.plus({ days: 2 });
        
        for (const row of content) {
            if (row.bookmakers.length > 0) {
                const commence_time = DateTime.fromISO(row.commence_time);
                if (commence_time <= date_limit) {
                    const match = new Odds(row);
                    data.push(match);
                }
            }
        }
        
    } catch (error) {
        console.error('Lỗi !!!!!!!!!!!!!');
    }
    
    return data;
};

const handleUEFAEuro = async (message, args) => {

    
    const option = args[0].toLowerCase();
    
    switch (option) {
        case 'a':
            try {
                const oddsList = await getOddsByLeague("soccer_uefa_european_championship", "UEFA Euro 2024");
                let response = `🧾Tỷ lệ Châu Âu (1X2) Của Ngày Hôm Nay🧾\n===================================\n`;
                oddsList.slice(0, 3).forEach(odds => {
                   response += odds.toString() + '\n----------------------------------\n';
                });
                message.reply(response);
            } catch (error) {
                console.error('Error:', error);
                message.reply('Không tìm thấy ❌');
            }
            break;
        
        case 'b':
            try {
                const tieude = `🧾Tỷ lệ Chấp Của Ngày Hôm Nay🧾\n===================================\n `
                const spreads = await fetchAndParseOdds("soccer_uefa_european_championship", "UEFA Euro 2024");
                message.reply(tieude + spreads);
            } catch (error) {
                console.error('Error:', error);
                message.reply('Không tìm thấy ❌');
            }
            break;
        
        case 'c':
            try {
                const tieude = `🧾Tỷ lệ T/X Của Ngày Hôm Nay🧾\n===================================\n `
                const totals = await fetchAndParseTotals("soccer_uefa_european_championship", "UEFA Euro 2024");
                message.reply(tieude + totals);
            } catch (error) {
                console.error('Error:', error);
                message.reply('Không tìm thấy ❌');
            }
            break;
        
        default:
            message.reply('Không Hợp Lệ ⛔');
            break;
    }
};

const handleCopaAmerica = async (message, args) => {

    
    const option = args[0].toLowerCase();
    
    switch (option) {
        case 'a':
            try {            
                const oddsList = await getOddsByLeague("soccer_conmebol_copa_america", "Copa América");
                let response = `🧾Tỷ lệ Châu Âu (1X2) Của Ngày Hôm Nay🧾\n===================================\n`;
                oddsList.slice(0, 3).forEach(odds => {
                    response += odds.toString() + '\n----------------------------------\n';
                });
                message.reply(tieude + response);
            } catch (error) {
                console.error('Error:', error);
                message.reply('Không tìm thấy ❌');
            }
            break;
        
        case 'b':
            try {
                const tieude = `🧾Tỷ lệ Chấp Của Ngày Hôm Nay🧾\n===================================\n `
                const spreads = await fetchAndParseOdds("soccer_conmebol_copa_america", "Copa América");
                message.reply(tieude +spreads );
            } catch (error) {
                console.error('Error:', error);
                message.reply('Không tìm thấy ❌');
            }
            break;
        
        case 'c':
            try {
                const tieude = `🧾Tỷ lệ T/X Của Ngày Hôm Nay🧾\n===================================\n `
                const totals = await fetchAndParseTotals("soccer_conmebol_copa_america", "Copa América");
                message.reply(tieude + totals);
            } catch (error) {
                console.error('Error:', error);
                message.reply('Không tìm thấy ❌');
            }
            break;
        
        default:
            message.reply('Không Hợp Lệ ⛔');
            break;
    }
};

module.exports = {
    config: {
        name: "fob",
        version: "1.0",
        author: "@haohanxabo",
        countDown: 0,
        role: 0,
        shortDescription: {
            vi: "Xem Rate Bóng Đá",
            en: "View Football rate"
        },
        description: {
            vi: "Dùng prefix + fob là được",
            en: "Use prefix + fob"
        },
        category: "box chat",
        guide: {
            vi: "Dùng prefix + fob là được",
            en: "Use prefix + fob"
        }
    },

    onStart: async function ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
        try {
            if (args.length === 0) {
                const discordGuide = `
┍━━━━━ Hướng dẫn sử dụng lệnh Football rate ⚽  ━━━━━┑
  1. Xem Tỷ Lệ 1x2 (Chiến thắng, Hòa, Thua)              
     · Sử dụng lệnh -fob 1a cho UEFA Euro 2024.
     · Sử dụng lệnh -fob 2a cho Copa América.

  2. Xem Tỷ Lệ Chấp
     · Sử dụng lệnh -fob 1b cho UEFA Euro 2024.
     · Sử dụng lệnh -fob 2b cho Copa América.

  3. Xem Tỷ Lệ Tổng Bàn Thắng
     · Sử dụng lệnh -fob 1c cho UEFA Euro 2024.
     · Sử dụng lệnh -fob 2c cho Copa América.
┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`;

// Sử dụng message.reply để gửi hướng dẫn sử dụng vào channel
message.reply(discordGuide);
                return;
            }
            
            const competition_choice = args[0].toLowerCase();
            
            switch (competition_choice) {
                case '1a':
                case '1b':
                case '1c':
                    await handleUEFAEuro(message, [competition_choice.substring(1)]);
                    break;
                
                case '2a':
                case '2b':
                case '2c':
                    await handleCopaAmerica(message, [competition_choice.substring(1)]);
                    break;
                
                default:
                    message.reply("Không Hợp Lệ ⛔");
                    break;
            }
            
        } catch (error) {
            console.error('Error:', error);
            message.reply("Lỗi !!!!!!!!!!!!!");
        }
    },

    onMessage: async function ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
        try {
            const competition_choice = args[0].toLowerCase();
            
            switch (competition_choice) {
                case '1a':
                case '1b':
                case '1c':
                    await handleUEFAEuro(message, [competition_choice.substring(1)]);
                    break;
                
                case '2a':
                case '2b':
                case '2c':
                    await handleCopaAmerica(message, [competition_choice.substring(1)]);
                    break;
                
                default:
                    message.reply("Không Hợp Lệ ⛔");
                    break;
            }
        } catch (error) {
            console.error('Error:', error);
            message.reply("Lỗi !!!!!!!!!!!!!");
        }
    }
};
