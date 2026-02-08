import fs from "fs";
import path from "path";
import db from "./connection.js";

db.exec("PRAGMA foreign_keys = ON");

const array_question_id = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53];

for (const ques_id of array_question_id) {

    const question_id = ques_id;

    const question = db.prepare('SELECT * FROM question WHERE id = ?').get(question_id);

    const category_ids = question?.name
        .match(/\[(.*?)\]/)?.[1]
        .split(',')
        .map(Number) || [];

    if (category_ids.length === 0) {
        console.log("No categories found");
    } else {
        const placeholders = category_ids.map(() => '?').join(',');

        const categories = db
            .prepare(`SELECT * FROM category WHERE id IN (${placeholders})`)
            .all(category_ids);

        const categoriesWithArray = categories.map(cat => ({
            ...cat,
            description_array: cat.description
                .split(',')
                .map(d => d.trim())
                .filter(Boolean)
        }));

        if (categoriesWithArray.length > 0) {

            const questionArray = categoriesWithArray.map(ques => ({
                id_question: question_id,
                id_category: ques.id,
                description_array: ques.description
                    .split(',')
                    .map(d => d.trim())
                    .filter(Boolean)
            }));

            const transformed = questionArray.flatMap(item =>
                item.description_array.map(desc => ({
                    id_question: item.id_question,
                    id_category: item.id_category,
                    description: desc
                }))
            );

            if (transformed.length > 0) {

                const questions = transformed.map(que => ({
                    id_question: que.id_question,
                    id_category: que.id_category,
                    name: question.name.replace(/\[.*?\]/, que.description),
                    description: "",
                    mp3: "",
                    image: que.id_category + ".jpg",
                    active: "true"
                }));

                if (questions.length > 0) {

                    // Prepare insert
                    const insert = db.prepare(`
                    INSERT INTO question_category (id_question, id_category, name, description, mp3, image, active)
                    VALUES (@id_question, @id_category, @name, @description, @mp3, @image, @active)
                    `);

                    // Prevent double question
                    for (const ques of questions) {
                        const exists = db
                            .prepare(`
                            SELECT 1 
                            FROM question_category 
                            WHERE id_question = ? AND name = ?
                        `)
                            .get(ques.id_question, ques.name);

                        if (!exists) {
                            insert.run(ques);
                            console.log("🌱 Inserted:", ques.name);
                        } else {
                            console.log("ℹ️ Skipped duplicate:", ques.name);
                        }
                    }
                }
            }
        }
    }
}

export default db;
