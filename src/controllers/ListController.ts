

import { sessions } from '../server.js';
import { ListsModel } from '../models/ListsModel.js';
import { IncomingMessage, ServerResponse } from 'http';

export class ListController {
    static async getLists(req: any, res: any) {
        console.log("Get lists activated");
        try {
            const sessionId = req.headers.cookie.split('=')[1];
            const username = sessions.get(sessionId);
            console.log("Username", username);
            if (!username) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not authenticated' }));
                return;
            }

            const result = await ListsModel.getListsByUser(username);
            console.log("Result", result);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (error) {
            res.writeHead(500);
            res.end(`Error: ${(error as { message: string }).message}`);
        }
    }

    static async addList(req: any, res: any, body: any) {
        try {
            const sessionId = req.headers.cookie.split('=')[1];
            const username = sessions.get(sessionId);

            if (!username) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not authenticated' }));
                return;
            }

            const result = await ListsModel.addListForUser(body.name, username);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result[0]));

        } catch (error) {
            res.writeHead(500);
            res.end(`Error: ${(error as { message: string }).message}`);
        }
    }
    static async addItem(req: any, res: any, body: any) {
        try {
            const sessionId = req.headers.cookie.split('=')[1];
            const username = sessions.get(sessionId);

            if (!username) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not authenticated' }));
                return;
            }

            const result = await ListsModel.addItemToList(body.listId, body.productId);

            if (result) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Item successfully added to list" }));
            } else {
                throw new Error("Failed to add item to list");
            }
        } catch (error) {
            res.writeHead(500);
            res.end(`Error: ${(error as { message: string }).message}`);
        }
    }


    static async removeList(req: any, res: any) {
        try {
            const sessionId = req.headers.cookie.split('=')[1];
            const username = sessions.get(sessionId);

            if (!username) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not authenticated' }));
                return;
            }

            const listId = req.url.split('/')[2];

            const result = await ListsModel.removeList(listId);

            if (result) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "List successfully removed" }));
            } else {
                throw new Error("Failed to remove list");
            }
        } catch (error) {
            res.writeHead(500);
            res.end(`Error: ${(error as { message: string }).message}`);
        }
    }

    static async removeItem(listId: any, productId: any, req: any, res: any) {
        try {
            // Data validation
            if (!listId || !productId) {
                throw new Error('Invalid listId or productId');
            }

            const sessionId = req.headers.cookie.split('=')[1];
            const username = sessions.get(sessionId);

            if (!username) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not authenticated' }));
                return;
            }
            const result = await ListsModel.removeItemFromList(listId, productId);
            if (result) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Item successfully removed from list" }));
            } else {
                throw new Error("Failed to remove item from list");
            }
        } catch (error) {
            console.error(error); // Print the entire error
            res.writeHead(500);
            res.end(`Error: ${(error as { message: string }).message}`);
        }
    }

    static async getProductsForList(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const listId: number = Number(new URL(req.url as string, `http://${req.headers.host}`).searchParams.get('listId'));
        try {
            const productIds: number[] = await ListsModel.getProductIdsForList(listId);
            req.url = JSON.stringify({ productIds });
            //ProductController.getMultipleProducts(req, res);
        } catch (error) {
            console.error(error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    }
}