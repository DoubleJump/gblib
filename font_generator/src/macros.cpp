#define KILOBYTES(value) ((value)*1024LL)
#define MEGABYTES(value) (KILOBYTES(value)*1024LL)
#define GIGABYTES(value) (MEGABYTES(value)*1024LL)
#define TERABYTES(value) (GIGABYTES(value)*1024LL)
#define ARRAY_COUNT(Array) (sizeof(Array) / sizeof((Array)[0]))

#define FLAG_SET(mask, flag) ((flag & mask) == flag)
#define FOR(index, start, end) for(memsize index = start; index < end; ++index)