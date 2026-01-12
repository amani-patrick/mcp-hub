import { RuleEngine, BruteForceRule } from '../src/engine/RuleEngine';
import { LogEvent } from '../src/models/event';

describe('RuleEngine', () => {
    let engine: RuleEngine;

    beforeEach(() => {
        engine = new RuleEngine();
    });

    it('should detect brute force attacks', () => {
        engine.registerRule(BruteForceRule);

        const events: LogEvent[] = [
            { id: '1', timestamp: '2023-01-01T10:00:00Z', level: 'WARN', source: 'auth', message: 'Failed login', metadata: { ip: '1.2.3.4' } },
            { id: '2', timestamp: '2023-01-01T10:00:01Z', level: 'WARN', source: 'auth', message: 'Failed login', metadata: { ip: '1.2.3.4' } },
            { id: '3', timestamp: '2023-01-01T10:00:02Z', level: 'WARN', source: 'auth', message: 'Failed login', metadata: { ip: '1.2.3.4' } },
            { id: '4', timestamp: '2023-01-01T10:00:03Z', level: 'WARN', source: 'auth', message: 'Failed login', metadata: { ip: '1.2.3.4' } },
        ];

        const findings = engine.evaluate(events);
        expect(findings).toHaveLength(1);
        expect(findings[0]).toContain('Potential Brute Force');
    });

    it('should not flag normal activity', () => {
        engine.registerRule(BruteForceRule);

        const events: LogEvent[] = [
            { id: '1', timestamp: '2023-01-01T10:00:00Z', level: 'INFO', source: 'auth', message: 'Login successful', metadata: { ip: '1.2.3.4' } },
            { id: '2', timestamp: '2023-01-01T10:00:01Z', level: 'WARN', source: 'auth', message: 'Failed login', metadata: { ip: '1.2.3.4' } },
        ];

        const findings = engine.evaluate(events);
        expect(findings).toHaveLength(0);
    });
});
