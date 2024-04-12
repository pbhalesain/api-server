import ErrorMiddleware from '@/middleware/error.middleware';
import Controller from '@/utils/interfaces/controller.interfaces';
import compression from 'compression';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import config from "./config/config";

class App {
	public app: Application;
	public port: number;
	public env: string;

	constructor(controllers: Controller[]) {
		this.app = express();
		this.port = config.port;
		this.env = config.env;

		this.initialiseDatabaseConnection();
		this.initialiseMiddlewares();
		this.intialiseControllers(controllers);
		this.initialiseErrorHandling();
	}

	private initialiseDatabaseConnection(): void {
		mongoose.connect(config.database.uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		});
	}

	private initialiseMiddlewares(): void {
		this.app.use(compression());
		this.app.use(cors());
		this.app.use(morgan('dev'));
		this.app.use(helmet());
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: false }));
	}

	private intialiseControllers(controllers: Controller[]): void {
		controllers.forEach(controller => {
			this.app.use('/', controller.router);
		});
	}

	private initialiseErrorHandling(): void {
		this.app.use(ErrorMiddleware.notFound);
		this.app.use(ErrorMiddleware.generic);
	}
}