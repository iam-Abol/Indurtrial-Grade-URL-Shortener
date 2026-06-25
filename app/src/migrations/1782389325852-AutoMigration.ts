import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1782389325852 implements MigrationInterface {
    name = 'AutoMigration1782389325852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "click_analytics" ("id" SERIAL NOT NULL, "ip_hash" character varying(64) NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "country" character varying(100), "user_agent" text, "browser" character varying(100), "device_type" character varying(100), "referer_domain" character varying(255) NOT NULL, "is_bot" boolean NOT NULL DEFAULT false, "os" character varying(45) NOT NULL, "url_id" integer, CONSTRAINT "PK_ccf76fff88c477b925404aaad82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2a24fb9052f583365c0b2e2fb0" ON "click_analytics" ("url_id") `);
        await queryRunner.query(`CREATE TABLE "url" ("id" SERIAL NOT NULL, "customAlias" character varying, "shortCode" character varying(10), "longUrl" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expire_at" TIMESTAMP, "click_count" integer NOT NULL DEFAULT '0', "deleted_at" TIMESTAMP, "userId" integer, CONSTRAINT "UQ_df4aaf7b2c247152f3e92fe7c78" UNIQUE ("shortCode"), CONSTRAINT "PK_7421088122ee64b55556dfc3a91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_41223f7fc768f24f696001a404" ON "url" ("customAlias") `);
        await queryRunner.query(`CREATE INDEX "IDX_df4aaf7b2c247152f3e92fe7c7" ON "url" ("shortCode") `);
        await queryRunner.query(`CREATE INDEX "IDX_356800d8e3299549be9a9febd7" ON "url" ("expire_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_990f9725d1269487c1410eeb58" ON "url" ("expire_at", "deleted_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_a0fe3b28d227640711773da3d7" ON "url" ("userId", "created_at") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "click_analytics" ADD CONSTRAINT "FK_2a24fb9052f583365c0b2e2fb0b" FOREIGN KEY ("url_id") REFERENCES "url"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "url" ADD CONSTRAINT "FK_2919f59acab0f44b9a244d35bdb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "url" DROP CONSTRAINT "FK_2919f59acab0f44b9a244d35bdb"`);
        await queryRunner.query(`ALTER TABLE "click_analytics" DROP CONSTRAINT "FK_2a24fb9052f583365c0b2e2fb0b"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a0fe3b28d227640711773da3d7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_990f9725d1269487c1410eeb58"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_356800d8e3299549be9a9febd7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df4aaf7b2c247152f3e92fe7c7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_41223f7fc768f24f696001a404"`);
        await queryRunner.query(`DROP TABLE "url"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2a24fb9052f583365c0b2e2fb0"`);
        await queryRunner.query(`DROP TABLE "click_analytics"`);
    }

}
