import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService, ChartResult } from './app.service';
import { Page } from './utils/decorators/page.decorator';

@Controller()
export class AppController {
	constructor(private readonly service: AppService) {}

	@Page()
	@Get('/')
	public index(): PageProps {
		return {};
	}

	@Get('/datasets')
	public getDatasets(): string[] {
		return this.service.getDatasets();
	}

	@Post('/datasets')
	@UseInterceptors(FileInterceptor('data'))
	public async addDataset(@UploadedFile() file: Express.Multer.File, @Body('name') name: string): Promise<void> {
		return this.service.addDataset(file, name.replace(/\s/g, '_'));
	}

	@Get('/genes')
	public async getGenes(@Query('datasets') datasets: string): Promise<string[]> {
		return this.service.getGenes(datasets.split(','));
	}

	@Get('/plots')
	public async getPlots(
		@Query('datasets') datasets: string,
		@Query('gene') gene: string,
		@Query('groupBy') groupBy: string,
		@Query('splitBy') splitBy: string
	): Promise<Record<string, ChartResult>> {
		return this.service.generate(datasets.split(','), gene, groupBy, splitBy);
	}
}

