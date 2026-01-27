/**
 * Repair Tickets API
 * 
 * Manages repair tickets for device repair and diagnostics workflow:
 * - Create, read, update, delete repair tickets
 * - Track customer information and device details
 * - Monitor repair status and progress
 * - Generate cost estimates
 * 
 * @module tickets
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Storage for tickets (in production, use a database)
const TICKETS_DIR = path.join(process.cwd(), 'data', 'tickets');
if (!fs.existsSync(TICKETS_DIR)) {
  fs.mkdirSync(TICKETS_DIR, { recursive: true });
}

/**
 * Load ticket from storage
 */
function loadTicket(ticketId) {
  const ticketPath = path.join(TICKETS_DIR, `${ticketId}.json`);
  if (!fs.existsSync(ticketPath)) {
    return null;
  }
  const data = fs.readFileSync(ticketPath, 'utf8');
  return JSON.parse(data);
}

/**
 * Save ticket to storage
 */
function saveTicket(ticket) {
  const ticketPath = path.join(TICKETS_DIR, `${ticket.id}.json`);
  fs.writeFileSync(ticketPath, JSON.stringify(ticket, null, 2), 'utf8');
}

/**
 * Load all tickets
 */
function loadAllTickets() {
  if (!fs.existsSync(TICKETS_DIR)) {
    return [];
  }
  const files = fs.readdirSync(TICKETS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const data = fs.readFileSync(path.join(TICKETS_DIR, f), 'utf8');
    return JSON.parse(data);
  });
}

/**
 * POST /api/v1/tickets
 * Create a new repair ticket
 */
router.post('/', (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deviceType,
      deviceManufacturer,
      deviceModel,
      deviceSerial,
      deviceImei,
      issueDescription,
      estimatedCost,
      priority
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !deviceType || !issueDescription) {
      return res.status(400).sendEnvelope({
        error: 'Missing required fields',
        required: ['customerName', 'customerPhone', 'deviceType', 'issueDescription']
      });
    }

    const ticket = {
      id: uuidv4(),
      ticketNumber: `TKT-${Date.now()}`,
      status: 'pending',
      priority: priority || 'normal',
      customer: {
        name: customerName,
        email: customerEmail || null,
        phone: customerPhone
      },
      device: {
        type: deviceType,
        manufacturer: deviceManufacturer || null,
        model: deviceModel || null,
        serial: deviceSerial || null,
        imei: deviceImei || null
      },
      issue: {
        description: issueDescription,
        category: null,
        severity: null
      },
      cost: {
        estimated: estimatedCost || 0,
        actual: null,
        currency: 'USD'
      },
      timeline: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        started: null,
        completed: null,
        estimatedCompletion: null
      },
      notes: [],
      diagnostics: [],
      repairSteps: []
    };

    saveTicket(ticket);

    res.status(201).sendEnvelope({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to create ticket',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/tickets
 * List all repair tickets
 */
router.get('/', (req, res) => {
  try {
    const { status, priority, deviceType } = req.query;
    
    let tickets = loadAllTickets();

    // Apply filters
    if (status) {
      tickets = tickets.filter(t => t.status === status);
    }
    if (priority) {
      tickets = tickets.filter(t => t.priority === priority);
    }
    if (deviceType) {
      tickets = tickets.filter(t => t.device.type === deviceType);
    }

    // Sort by creation date (newest first)
    tickets.sort((a, b) => new Date(b.timeline.created) - new Date(a.timeline.created));

    res.sendEnvelope({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    console.error('Error listing tickets:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to list tickets',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/tickets/:id
 * Get a specific repair ticket
 */
router.get('/:id', (req, res) => {
  try {
    const ticket = loadTicket(req.params.id);
    
    if (!ticket) {
      return res.status(404).sendEnvelope({
        error: 'Ticket not found',
        ticketId: req.params.id
      });
    }

    res.sendEnvelope({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error getting ticket:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to get ticket',
      message: error.message
    });
  }
});

/**
 * PUT /api/v1/tickets/:id
 * Update a repair ticket
 */
router.put('/:id', (req, res) => {
  try {
    const ticket = loadTicket(req.params.id);
    
    if (!ticket) {
      return res.status(404).sendEnvelope({
        error: 'Ticket not found',
        ticketId: req.params.id
      });
    }

    const { status, priority, actualCost, notes } = req.body;

    // Update fields
    if (status) {
      ticket.status = status;
      if (status === 'in_progress' && !ticket.timeline.started) {
        ticket.timeline.started = new Date().toISOString();
      }
      if (status === 'completed' && !ticket.timeline.completed) {
        ticket.timeline.completed = new Date().toISOString();
      }
    }
    if (priority) {
      ticket.priority = priority;
    }
    if (actualCost !== undefined) {
      ticket.cost.actual = actualCost;
    }
    if (notes) {
      ticket.notes.push({
        id: uuidv4(),
        text: notes,
        timestamp: new Date().toISOString()
      });
    }

    ticket.timeline.updated = new Date().toISOString();

    saveTicket(ticket);

    res.sendEnvelope({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to update ticket',
      message: error.message
    });
  }
});

/**
 * DELETE /api/v1/tickets/:id
 * Delete a repair ticket
 */
router.delete('/:id', (req, res) => {
  try {
    const ticketPath = path.join(TICKETS_DIR, `${req.params.id}.json`);
    
    if (!fs.existsSync(ticketPath)) {
      return res.status(404).sendEnvelope({
        error: 'Ticket not found',
        ticketId: req.params.id
      });
    }

    fs.unlinkSync(ticketPath);

    res.sendEnvelope({
      success: true,
      message: 'Ticket deleted',
      ticketId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to delete ticket',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/tickets/:id/diagnostics
 * Add diagnostic results to a ticket
 */
router.post('/:id/diagnostics', (req, res) => {
  try {
    const ticket = loadTicket(req.params.id);
    
    if (!ticket) {
      return res.status(404).sendEnvelope({
        error: 'Ticket not found',
        ticketId: req.params.id
      });
    }

    const { type, results } = req.body;

    if (!type || !results) {
      return res.status(400).sendEnvelope({
        error: 'Missing required fields',
        required: ['type', 'results']
      });
    }

    ticket.diagnostics.push({
      id: uuidv4(),
      type,
      results,
      timestamp: new Date().toISOString()
    });

    ticket.timeline.updated = new Date().toISOString();
    saveTicket(ticket);

    res.sendEnvelope({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error adding diagnostics:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to add diagnostics',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/tickets/:id/repair-steps
 * Add repair steps to a ticket
 */
router.post('/:id/repair-steps', (req, res) => {
  try {
    const ticket = loadTicket(req.params.id);
    
    if (!ticket) {
      return res.status(404).sendEnvelope({
        error: 'Ticket not found',
        ticketId: req.params.id
      });
    }

    const { description, status } = req.body;

    if (!description) {
      return res.status(400).sendEnvelope({
        error: 'Missing required field: description'
      });
    }

    ticket.repairSteps.push({
      id: uuidv4(),
      description,
      status: status || 'pending',
      timestamp: new Date().toISOString(),
      completedAt: null
    });

    ticket.timeline.updated = new Date().toISOString();
    saveTicket(ticket);

    res.sendEnvelope({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error adding repair step:', error);
    res.status(500).sendEnvelope({
      error: 'Failed to add repair step',
      message: error.message
    });
  }
});

export default router;
