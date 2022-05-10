CREATE TABLE "public"."User" (
    id SERIAL PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),

    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    coins INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "public"."Article" (
    id SERIAL PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),

    "title" TEXT NOT NULL,

    "ownerId" INTEGER NOT NULL,
    FOREIGN KEY ("ownerId") REFERENCES "public"."User"(id)
);


CREATE TABLE "public"."Paragraph" (
    id SERIAL PRIMARY KEY NOT NULL,

    seq INTEGER NOT NULL,

    "tagName" VARCHAR(255) NOT NULL,

    "articleId" INTEGER NOT NULL,
    FOREIGN KEY ("articleId") REFERENCES "public"."Article"(id)
);

CREATE TABLE "public"."Phrase" (
    id SERIAL PRIMARY KEY NOT NULL,

    seq INTEGER NOT NULL,

    "st" TEXT NOT NULL, 
    "tt" TEXT,

    "paragraphId" INTEGER NOT NULL,
    FOREIGN KEY ("paragraphId") REFERENCES "public"."Paragraph"(id),

    "translatorId" INTEGER NOT NULL,
    FOREIGN KEY ("translatorId") REFERENCES "public"."User"(id)
);