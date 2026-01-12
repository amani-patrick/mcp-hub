import { GraphCorrelator } from '../src/correlators/GraphCorrelator';
import { LogEvent } from '../src/models/event';

describe('GraphCorrelator', () => {
    let correlator: GraphCorrelator;

    beforeEach(() => {
        correlator = new GraphCorrelator();
    });

    it('should correlate events sharing the same IP', async () => {
        const events: LogEvent[] = [
            {
                id: '1',
                timestamp: '2023-01-01T10:00:00Z',
                level: 'INFO',
                source: 'test',
                message: 'Event 1',
                metadata: { ip: '1.2.3.4' }
            },
            {
                id: '2',
                timestamp: '2023-01-01T10:01:00Z',
                level: 'INFO',
                source: 'test',
                message: 'Event 2',
                metadata: { ip: '1.2.3.4' }
            }
        ];

        const result = await correlator.correlate(events);
        expect(result).toHaveLength(2);
        expect(result[0].relatedEvents).toContain('2');
        expect(result[1].relatedEvents).toContain('1');
    });

    it('should correlate events indirectly via shared entities', async () => {
        // Event A has IP1
        // Event B has IP1 and User1
        // Event C has User1
        // A -> B -> C should be linked
        const events: LogEvent[] = [
            {
                id: 'A',
                timestamp: '2023-01-01T10:00:00Z',
                level: 'INFO',
                source: 'test',
                message: 'A',
                metadata: { ip: '1.2.3.4' }
            },
            {
                id: 'B',
                timestamp: '2023-01-01T10:01:00Z',
                level: 'INFO',
                source: 'test',
                message: 'B',
                metadata: { ip: '1.2.3.4', userId: 'alice' }
            },
            {
                id: 'C',
                timestamp: '2023-01-01T10:02:00Z',
                level: 'INFO',
                source: 'test',
                message: 'C',
                metadata: { userId: 'alice' }
            }
        ];

        const result = await correlator.correlate(events);
        expect(result).toHaveLength(3);

        const eventA = result.find(e => e.id === 'A');
        const eventC = result.find(e => e.id === 'C');

        expect(eventA?.relatedEvents).toContain('C');
        expect(eventC?.relatedEvents).toContain('A');
    });
});
