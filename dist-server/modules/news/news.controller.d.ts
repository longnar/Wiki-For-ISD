import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
export declare class NewsController {
    private readonly newsService;
    constructor(newsService: NewsService);
    getAllNews(): Promise<import("../../entities/news.entity").News[]>;
    getNewsById(id: number): Promise<import("../../entities/news.entity").News>;
    createNews(dto: CreateNewsDto): Promise<{
        message: string;
        patch: import("../../entities/news.entity").News;
    }>;
    updateNews(id: number, dto: Partial<CreateNewsDto>): Promise<{
        message: string;
        patch: import("../../entities/news.entity").News;
    }>;
    deleteNews(id: number): Promise<{
        message: string;
    }>;
}
