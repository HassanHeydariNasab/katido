CREATE TABLE "public"."User" (
    "id" SERIAL PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "modifiedAt" TIMESTAMP NOT NULL DEFAULT now(),

    "name" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(255) UNIQUE NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "public"."Article" (
    "id" SERIAL PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "modifiedAt" TIMESTAMP NOT NULL DEFAULT now(),

    "title" TEXT NOT NULL,

    "ownerId" INTEGER NOT NULL,
    FOREIGN KEY ("ownerId") REFERENCES "public"."User"(id)
);


CREATE TABLE "public"."Phrase" (
    "id" SERIAL PRIMARY KEY NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "modifiedAt" TIMESTAMP NOT NULL DEFAULT now(),

    "st" TEXT NOT NULL, 
    "tt" TEXT NOT NULL,

    "score" INTEGER DEFAULT 0,

    "translatorId" INTEGER,
    FOREIGN KEY ("translatorId") REFERENCES "public"."User"(id)
);
