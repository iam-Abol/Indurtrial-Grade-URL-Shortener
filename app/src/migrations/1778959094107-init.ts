import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1778959094107 implements MigrationInterface {
  name = 'Init1778959094107';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "click_analytics" ("id" SERIAL NOT NULL, "ip" character varying(45) NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "country" character varying(100), "user_agent" text, "browser" character varying(100), "device" character varying(100), "referer" text, "urlId" integer, CONSTRAINT "PK_ccf76fff88c477b925404aaad82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a9f76e99f4703031467a782ef0" ON "click_analytics" ("urlId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "url" ("id" SERIAL NOT NULL, "customAlias" character varying, "shortCode" character varying(10) NOT NULL, "longUrl" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expire_at" TIMESTAMP, "click_count" integer NOT NULL DEFAULT '0', "deleted_at" TIMESTAMP, "userId" integer, CONSTRAINT "UQ_41223f7fc768f24f696001a4041" UNIQUE ("customAlias"), CONSTRAINT "UQ_df4aaf7b2c247152f3e92fe7c78" UNIQUE ("shortCode"), CONSTRAINT "PK_7421088122ee64b55556dfc3a91" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_df4aaf7b2c247152f3e92fe7c7" ON "url" ("shortCode") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "click_analytics" ADD CONSTRAINT "FK_a9f76e99f4703031467a782ef0a" FOREIGN KEY ("urlId") REFERENCES "url"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "url" ADD CONSTRAINT "FK_2919f59acab0f44b9a244d35bdb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "url" DROP CONSTRAINT "FK_2919f59acab0f44b9a244d35bdb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "click_analytics" DROP CONSTRAINT "FK_a9f76e99f4703031467a782ef0a"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_df4aaf7b2c247152f3e92fe7c7"`,
    );
    await queryRunner.query(`DROP TABLE "url"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a9f76e99f4703031467a782ef0"`,
    );
    await queryRunner.query(`DROP TABLE "click_analytics"`);
  }
}
