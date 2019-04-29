#include <stdint.h>
#include <cstdlib>
#include <stdio.h>
//#include <locale.h>
//#include <wchar.h>
#include <cstring>

char* get_line(FILE* file, int max_size)
{
  char line[max_size];
  fgets(line, max_size, file);

  int index = 0;
  while(true)
  {
	char c = line[index];
	if(c == '\0' || c == EOF || c == '\n')
	{
	  break;
	}
	index++;
	if(index == max_size) break;
  }

  printf("%i\n", index);
  int len = strlen(line);
  printf("%i\n", len);

  char* result = (char*)malloc(index+1);
  for(int i = 0; i < index; ++i)
  {
	result[i] = line[i];
  };

  result[index] = '\0';
  printf("%s\n", result);

  return result;
}


int read_utf8(u8* src, int* result)
{
	//TODO: return number of bytes advanced

	if(!src) return 0;
	/*
	0xxx xxxx    A single-byte US-ASCII code (from the first 127 characters)
	110x xxxx    One more byte follows
	1110 xxxx    Two more bytes follow
	1111 0xxx    Three more bytes follow
	10xx xxxx    A continuation of one of the multi-byte characters
	*/

	if(*src == 0U) 
	{
		return 0;
	}

	if(*src < 128U) 
	{
		*result = (int)*src;
		return 1;
	}

	if(*src < 192U) 
	{
		return 0;
	}

	if(*src < 224U) 
	{
		if(src[1] >= 128U && src[1] < 192U)
		{
			*result = ((src[0] - 192U) << 6U) | (src[1] - 128U);
			return 2;
		}
		return 0;
	}

	if(*src < 240U) 
	{
		if(src[1] >= 128U && src[1] < 192U && src[2] >= 128U && src[2] < 192U) 
		{
			result = ((src[0] - 224U) << 12U) | ((src[1] - 128U) << 6U) | (src[2] - 128U);
			return 3;
		}
		return 0;
	}

	if(*src < 248U) 
	{
	  if(src[1] >= 128U && src[1] < 192U &&
		  src[2] >= 128U && src[2] < 192U &&
		  src[3] >= 128U && src[3] < 192U)
	  {
			result = ((src[0] - 240U) << 18U)
			   | ((src[1] - 128U) << 12U)
			   | ((src[2] - 128U) << 6U)
			   |  (src[3] - 128U);
		return 4;
	  }
	  return 0;
	}

	if(*src < 252U) 
	{
		if(src[1] >= 128U && src[1] < 192U &&
			src[2] >= 128U && src[2] < 192U &&
			src[3] >= 128U && src[3] < 192U &&
			src[4] >= 128U && src[4] < 192U)
	{
	  result = ((src[0] - 248U) << 24U)
		   | ((src[1] - 128U) << 18U)
		   | ((src[2] - 128U) << 12U)
		   | ((src[3] - 128U) << 6U)
		   |  (src[4] - 128U);
		return 5;
	}
	return 0;
  }

  if(*src < 254U) 
  {
	  if (src[1] >= 128U && src[1] < 192U &&
		  src[2] >= 128U && src[2] < 192U &&
		  src[3] >= 128U && src[3] < 192U &&
		  src[4] >= 128U && src[4] < 192U &&
		  src[5] >= 128U && src[5] < 192U)
	  {
		  return ((src[0] - 252U) << 30U)
			   | ((src[1] - 128U) << 24U)
			   | ((src[2] - 128U) << 18U)
			   | ((src[3] - 128U) << 12U)
			   | ((src[4] - 128U) << 6U)
			   |  (src[5] - 128U);
	  }
	  return 6;
	}
}

struct File_Buffer
{
	u8* buffer;
	u64 size;
}

File_Buffer read_binary_file(char* path)
{
	assert(path, "File path is null");

	File_Buffer result;
	FILE* file = fopen("myfile.txt", "rb");
	assert(file, "Could not open file: %s", path);

	fseek(file, 0, SEEK_END);  
	result.size = ftell(file);     
	rewind(file);
	// Enough memory for file + \0
	result.buffer = (u8*)malloc((result.size+1)*sizeof(u8)); 
	fread(result.buffer, result.size, 1, file);
	fclose(file); 
	return result;
}


int main(int argc, char* argv[])
{
	{
		auto CONFIG_PATH = argv[1];
		File_Buffer file = read_binary_file(CONFIG_PATH); //UTF8 is binary

		u8* buffer = file.buffer;
		int character_count;
		while(true)
		{
			int code_point = 0;
			int stride = read_utf8(buffer, &code_point);
			if(stride == 0)
			{
				break;
			}
			buffer += stride;
		}
	}

	//printf("%s", SRC_PATH);
	//printf("%s", DST_PATH);
	//printf("%s", PNG_PATH);
	//printf("%s", characters);


	{
	  FILE* file = fopen(SRC_PATH, "rb");
	  if(!file)
	  {
		  printf("Could not open font file\n");
		  return -1;
	  }

	  fclose(file);
	}

}