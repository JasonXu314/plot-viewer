import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { existsSync, readdirSync, readFileSync, rmSync } from 'fs';

export interface ChartResult {
	clustering: string;
	violin: string;
}

@Injectable()
export class AppService {
	public getDatasets(): string[] {
		return readdirSync('datasets').filter((dataset) => existsSync(`datasets/${dataset}/data.rds`));
	}

	public async getGenes(datasets: string[]): Promise<string[]> {
		return Promise.all(
			datasets.map(
				(dataset) =>
					new Promise<string[]>((resolve, reject) => {
						const proc = spawn('Rscript', ['../../genes.r'], { cwd: `datasets/${dataset}` });

						let stdout = '',
							stderr = '';

						proc.stdout.on('data', (chunk) => (stdout += chunk));
						proc.stderr.on('data', (chunk) => (stderr += chunk));

						proc.on('error', () => reject(new Error(`Error reading genes of '${dataset}'`)));
						proc.on('exit', () => resolve(stdout.split('\n').filter((ln) => ln !== '')));
					})
			)
		).then((geneSets) => geneSets.slice(1).reduce((curr, next) => curr.filter((gene) => next.includes(gene)), geneSets[0]));
	}

	public async generate(datasets: string[], gene: string, groupBy: string, splitBy: string): Promise<Record<string, ChartResult>> {
		return Promise.all(
			datasets.map(
				(dataset) =>
					new Promise<ChartResult>((resolve, reject) => {
						const proc = spawn('Rscript', ['../../plot.r', gene, groupBy, splitBy], { cwd: `datasets/${dataset}` });

						let stdout = '',
							stderr = '';

						proc.stdout.on('data', (chunk) => (stdout += chunk));
						proc.stderr.on('data', (chunk) => (stderr += chunk));

						proc.on('error', () => reject(new Error(`Error reading genes of '${dataset}'`)));
						proc.on('exit', () => {
							try {
								const clustering = 'data:image/png;base64,' + readFileSync(`datasets/${dataset}/clustering.png`).toString('base64');
								const violin = 'data:image/png;base64,' + readFileSync(`datasets/${dataset}/violin.png`).toString('base64');

								rmSync(`datasets/${dataset}/clustering.png`);
								rmSync(`datasets/${dataset}/violin.png`);

								resolve({ clustering, violin });
							} catch (e) {
								console.error(e);
								console.error('stdout', stdout);
								console.error('stderr', stderr);
								reject(new Error(`Unable to find plot of '${dataset}'`));
							}
						});
					})
			)
		).then((results) => Object.fromEntries(results.map((result, i) => [datasets[i], result])));
	}
}

