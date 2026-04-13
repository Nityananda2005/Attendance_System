import { isMatchingSession } from "./sessionMatchers.js";

let clients = [];

/**
 * @desc Add a new SSE client with tracking info
 * @param {Object} req - The request object (must contain query params)
 * @param {Object} res - The response object
 */
export const addClient = (req, res) => {
    const { department, semester } = req.query;
    
    // Standardize input
    const depts = department ? department.split(',').map(d => d.trim().toLowerCase()) : [];
    const sem = semester ? semester.toString().trim().toLowerCase() : '';

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const client = { res, department: depts, semester: sem };
    clients.push(client);

    req.on('close', () => {
        clients = clients.filter(c => c !== client);
    });
};

/**
 * @desc Send targeted notification to specific students
 * @param {Object} data - The message payload
 * @param {Array} targetDepts - The branches the session is for
 * @param {String} targetSem - The semester the session is for
 */
export const sendNotificationToStudents = (data, targetDepts = [], targetSem = '') => {
    console.log(`[SSE] Broadcasting notification. Targets: Departments=[${targetDepts}], Sem=[${targetSem}]`);

    const sessionTarget = { department: targetDepts, semester: targetSem };

    clients.forEach((client, index) => {
        // Use the same robust matching as our analytics/history
        const shouldSend = isMatchingSession(client, sessionTarget);

        if (shouldSend) {
            console.log(`[SSE] SENDING to client ${index}: Depts=[${client.department}], Sem=${client.semester}`);
            client.res.write(`data: ${JSON.stringify(data)}\n\n`);
        } else {
            console.log(`[SSE] FILTERED OUT client ${index}: Depts=[${client.department}], Sem=${client.semester}`);
        }
    });
};


