// По собственной ошибке забил базу данных (mongodb)
// timestamp  с типом string, отчего не смог выбирать промежутки дат для графика
// Проблема в том, что timestamp - строка, а не Date
// Решение - перевести timestamp в Date
// Теперь могу выбирать данные из базы данных по датам, а не коллекцию целиком
// Этот файл не нуждается в запуске вместе с приложением, просто пример фикса
// и да, он крашится с ошибкой, я так и не поял отчего, вроде бы отрабатывает всё правильно
// но ошибка закрытия сессии есть
const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');

const uri = 'mongodb://localhost:27017/BitcoinHistory';
const client = new MongoClient(uri, { serverApi: { version: '1', strict: true, } });

async function updatingTimestamps() {
    try {
        const db = client.db('BitcoinHistory');
        const collection = db.collection('prices');

        // 1. Находим все документы, где timestamp - строка
        const cursor = collection.find({ timestamp: { $type: "string" } });
        
        // 2. Проходимся по каждому документу
        await cursor.forEach(async (doc) => {
            console.log("Найден документ с _id:", doc._id, "timestamp:", doc.timestamp);

            // 3. Преобразуем timestamp в Date
            const timestamp = moment(doc.timestamp, "ddd MMM DD YYYY HH:mm:ss ZZ").toDate();

            // 4. Обновляем документ
            await collection.updateOne({ _id: doc._id }, { $set: { timestamp } });
            console.log("Обновлен документ с _id:", doc._id);
        });

        console.log("Обновление timiestamps выполнено");

    } catch (error) {
        console.error("Ошибка обновления", error);
    } finally {
        await client.close();
    }
}

updatingTimestamps();




// const MongoClient = require('mongodb').MongoClient;
// const moment = require('moment');

// const uri = 'mongodb://localhost:27017/BitcoinHistory';
// const client = new MongoClient(uri, { serverApi: { version: '1', strict: true, } });

// async function updatingTimestamps() {
//     try {
//         // Убираем client.close() и client.connect()  внутри  updatingTimestamps()
//         const db = client.db('BitcoinHistory');
//         const collection = db.collection('prices');

//         const cursor = collection.find({});
//         await cursor.forEach(async (doc) => {
//             console.log("Обновляю документ с _id:", doc._id, "timestamp:", doc.timestamp);

//             const timestamp = moment(doc.timestamp, "ddd MMM DD YYYY HH:mm:ss ZZ").toDate();
//             console.log("Преобразованный timestamp:", timestamp);

//             await collection.updateOne({ _id: doc._id }, { $set: { timestamp } });
//             console.log("Обновлен документ с _id:", doc._id);
//         });
//         console.log("Обновление timiestamps выполнено");

//     } catch (error) {
//         console.error("Ошибка обновления", error);
//     } finally {
//         // client.close()  вызывается один раз в finally
//         await client.close();
//     }
// }

// updatingTimestamps();