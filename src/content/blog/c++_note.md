---
title: "C++ 学习笔记"
description: "从编译链接到面向对象，一份涵盖 C++ 核心知识点的详细学习笔记。"
date: 2026-05-16
tags: ["C++", "Notes", "Programming"]
---

### 1、编译

------

 c++并不关心你的文件 文件只是提供给编译器源代码的一种方式 你负责告诉编译器 你输入的是什么类型的文件 以及编译器应该如何处理它

**头文件实际上是编译器预处理的（为什么头文件不会被编译） 事先复制到了cpp文件中 于是头文件就和cpp一起被编译了 每个cpp文件都被编译成了object file(.obj)目标文件 然后用link粘合起来就是exe可执行文件 编译一个cpp就是obj 编译整个项目就是exe**

`#include` 实际上就是预处理器打开这个头文件 阅读它的所有内容 然后把它粘贴到你写的内容里 所以你可以写自己的头文件 命名为 什么什么.h

```c++
//EndBrace.h 自己写的头文件 内容只有一个}右括号 
}
```

```c++
//function.cpp
int function()
{
	//里面随便写点什么代码
#include "EndBrace.h" //这里就可以用这个include来代替这里缺的}

```

这就是预处理器做的 你如果写了一个`#define INTEGER int` 那么预处理器就会把你代码里所有的INTERGER替换成int 预处理完其实是得到一个 `.i` 文件

```c++
//function.i
int function()
{
	//里面随便写点什么代码
}
```

这就是 `.i` 文件里的样子 不过会比这个多一些编译器自动生成的注释

`#if` 让我们包含或者排除基于给定条件的代码

```c++
#if 1
int multiply(int a, int b)
{
    int result = a * b;
    return result;
}
#end if
```

在 `.i` 文件里就是

```c++
int multiply(int a, int b)
{
    int result = a * b;
    return result;
}
```

```c++
//如果是
#if 0
int multiply(int a, int b)
{
    int result = a * b;
    return result;
}
#end if

```

`.i` 文件里就什么都没有 这段就是被禁用的代码

(1) 预处理 (Preprocessing)

在 VS Code 终端中输入命令，手动执行预处理，就可以得到 **.i 文件**。

- **操作命令**：clang++ -E main.cpp -o main.i
- **现象**：打开生成的 main.i，你会发现文件变得非常长。因为它把 #include <iostream> 等头文件里的内容全部“复制粘贴”进来了，并且展开了所有的宏。这时候代码还是 C++ 源码，但已经没有了 # 开头的预处理指令。

(2)  编译为汇编 (Compilation to Assembly)

**obj 文件**（在 Linux 下是 .o）里全都是二进制，也就是机器代码，人类看不懂。我们要看汇编，需要生成 **.s 文件**。

- **操作命令**：clang++ -S main.cpp -o main.s
- **现象**：打开 main.s，这就是汇编语言。不再是机器代码了，而是 CPU 将要执行的实际指令（如 mov, push, ret）。
- **函数签名**：你会看到函数名变成了类似 _Z4mainv 这种看似乱码的东西，这就是 **Name Mangling**（名字修饰），用于唯一地定义你的函数，解决重载和链接问题。
- **效率观察**：如果变量设置得很多，你会看到大量的 mov 指令在寄存器和内存之间搬运数据，确实影响效率。

(3) 优化与常数折叠 (Optimization)

Debug 模式下不会给你做优化。

- **Debug 模式 (无优化)**：**操作**：Ctrl+Shift+P -> CMake: Select Variant -> 选择 **Debug**。**现象**：对应参数 -O0。此时生成的汇编指令非常啰嗦，因为编译器要保证每一行代码都能被调试，变量会老老实实地存储在内存里。
- **Release 模式 (最大优化)**：**操作**：Ctrl+Shift+P -> CMake: Select Variant -> 选择 **Release**。**现象**：对应参数 -O3。再重新 Build 并查看汇编（或使用 clang++ -S -O3 main.cpp -o main_opt.s），你会发现文件变小了。**常数折叠**：如果你写 return 5*2，在优化模式下的汇编里，你找不到乘法指令 imul，甚至可能连 mov eax, 10 都被优化成直接在返回路径上写死了一个 10。只要是常数，编译器在编译期就算好了。

(4) 查看机器码 (Machine Code)

怎么看机器码，不需要去翻二进制文件。

- **动态查看 ：**操作**：确保是 **Debug*模式。打断点，按 F5 启动调试。程序暂停后，Ctrl+Shift+P -> 输入 **Open Disassembly View** (打开反汇编视图)。**现象**：VS Code 会分屏显示。你不仅能看到**机器码**（16进制），还能看到它对应的**汇编指令**，最棒的是它会把你的 **C++ 源码**穿插在中间。你可以清楚地看到一行 C++ 代码对应了哪几行机器指令。

(5)  链接 (Linking)

这就是编译，这是没有链接之前做的事。其实就是预处理得到 .i，编译得到 .s (汇编)，汇编器再把它变成 .o (机器指令)。

- **只编译**：如果你只运行 clang++ -c main.cpp，就只会生成 main.o，不会报错（除非语法错误），也不会链接。
- **Build (生成) 或 F5**：当你点击 VS Code 下方的 **Build** 按钮时，CMake 会调用链接器（Linker / ld），把所有的 .o 文件以及标准库链接在一起，最终生成可执行文件 CppDemo。



### 2、链接

------

错误列表 C开头的错误代码 就是编译错误 LNK开头的错误代码 是链接错误

实际上程序的入口点并不一定是main函数 也可以在cmake配置文件中配置两个项目然后再底部状态栏进行配置

“未解决的外部符号”报错 就是链接器找不到它需要的东西

当我们进行构建的时候，如果我们f1里面调用了f2，并在main函数里面调用了f1,f2的声明在当前cpp文件中，函数体并不存在，当我们注释掉f1里面的f2的调用，在链接的过程中我们就不会发现错误，因为我们根本就没有使用f2，而当我们注释掉main函数中的f1的调用的时候，却出现了错误，因为虽然我们没有调用f1，但是编译器不能确保其他的文件中是否也没有使用，同时函数体也确实有定义，链接器确实需要链接它，所以如果我们可以告诉编译器这个f1函数我只会在这个cpp文件中使用它，就可以去掉这种链接的必要性了，简而言之，**只要f1被编译进了目标文件（.o），且它具有“外部链接属性”，链接器就必须确保f1所依赖的所有符号（即f2）都存在，无论main函数是否真的调用了f1。**如果在函数前面加一个 [static](https://chocomintopia.github.io/1-Cherno-C++.html#mypoint_7) 就说明这个函数只在当前cpp文件里会被使用 其它cpp文件里都不会用到 那么它就不用参与链接 其他cpp文件就不使用

> ### 情况一：注释掉 f1 中对 f2 的调用
>
> **结果：链接成功。**
>
> - **原因**：当你注释掉 f1 内部的 f2() 时，编译器生成的 f1 的机器码中不再包含对 f2 的引用。
> - 此时，f1 是一个完整的、合法的函数。虽然 main 调用了 f1，但 f1 不需要任何外部帮助。
> - 链接器在处理时，发现 f2 虽然被声明了，但在任何生成的机器码中都没有被引用（Reference），所以它根本不在乎 f2 是否存在。
>
> ### 情况二：注释掉 main 中对 f1 的调用（f1 仍调用 f2）
>
> **结果：链接错误（Undefined reference to f2）。**
>
> 这是让你困惑的地方：*既然 main 都不调用 f1 了，f1 也就没用了，为什么链接器还要管 f1 里面的 f2 呢？*
>
> #### 1. 编译阶段：生成了包含“隐患”的目标文件
>
> 当你编译这个 .cpp 文件时，编译器会按顺序翻译代码。
>
> - 它看到了 f1 的定义。
> - 它生成了 f1 的机器码。
> - 在 f1 的机器码中，它留下了一个**重定位条目（Relocation Entry）**，标记着：“这里需要跳转到 f2 的地址，请链接器稍后填上”。
> - **关键点**：默认情况下（非优化模式），编译器不会因为 main 没调用 f1 就把 f1 删掉。它会老老实实地把 f1 的代码生成在目标文件（.o）里。
>
> #### 2. 链接属性：f1 默认是“全局”的
>
> 在C++中，普通的函数（非 static）默认具有 **外部链接属性（External Linkage）**。
> 这意味着：虽然当前的 main 没调用 f1，但链接器认为 **其他文件（如果有的话）可能会调用这个 f1**。
>
> #### 3. 链接阶段：全量检查
>
> 当链接器（Linker）拿到你的目标文件时，它的逻辑是：
>
> 1. 把这个目标文件加入程序。
> 2. 扫描符号表。
> 3. 发现里面定义了符号 f1。
> 4. 发现 f1 的实现代码中引用了符号 f2（即 f2 是 Undefined）。
> 5. 链接器必须解析所有的 Undefined 符号，以保证程序的完整性。
> 6. 链接器在所有输入文件中查找 f2，发现找不到。
> 7. **报错**。
>
> 链接器不知道 f1 永远不会被执行，它只知道 f1 存在于二进制文件中，并且 f1 依赖 f2，如果不解决 f2，f1 就是坏的。而因为 f1 是导出符号，链接器不允许保留坏的导出符号。

参数不对 返回类型不对 函数名不对 都会发生链接错误

函数或者变量 有相同的名字和相同的签名 也会发生链接错误

比如你写了一个头文件Log.h 在里面定义了一个函数 然后在两个cpp里都调用这个头文件 实际上就是把这个头文件复制到了两个cpp文件里 那么就是两个cpp文件里都写了这个函数的定义 定义重复了 如果两个cpp里都调用了头文件里的同一个函数 就会报链接错误 “未解决的外部符号”

解决方案：

1. 可以把这个函数定义为static `static void Log(const char* message)`这样这个函数被复制过去之后 就只在cpp文件内部生效 内部函数对于其他obj文件不可见 不会参与链接
2. 也可以把这个函数前面加上inline 意思是将函数调用替换为函数体 也就是比如 定义了函数体 `std::cout << message << std::endl;` 函数名为 `inline void Log(const char* message)` 这样实际上调用 `Log("Initialized Log");` 就等于是替换成了`std::cout << "Initialized Log" << std::endl;` 而并不复制函数到达cpp文件里 只要函数体
3. **（最佳）**把这个Log函数 不再写在Log.h里 而是写在Log.cpp里 Log.cpp被称为翻译单元 然后在Log.h里只保留Log函数的声明 `void Log(const char* message);` 不用static 也不用inline 这样链接之后 其他cpp文件仍然可以调用Log函数 但并不会重复 就不会链接错误

### 3、C++ 源代码编译生成可执行文件过程

------



1. 预处理 【.cpp .h .hpp 到 .i】
   1. \#include 将头文件复制到源文件
   2. 处理宏定义#define 和 条件编译#ifdef、#endif
   3. 删除注释 添加行号和文件名标识（用于调试）
2. 编译 【.i 到 .s】
   1. 将预处理后的代码 转换为平台相关的**汇编代码** 人类可读
   2. 进行语法和语义检查 生成低级中间表示
3. 汇编 【.s 到 .o(Unix-like)/.obj(Windows)】
   1. 将汇编代码转换为**机器码** 生成二进制object file
   2. 目标文件包含代码段（机器指令） 数据段（全局变量） 符号表（函数/变量引用）
4. 链接 【.o/.obj .a .lib .so .dll 到 .exe(Windows)/无扩展名的可执行文件(Unix-like)】
   1. 合并所有目标文件和库 解析符号引用（如函数调用）
   2. 分配内存地址 生成最终可执行的二进制文件
   3. 处理静态库（代码直接嵌入） 动态库（运行时加载）

### 4、变量

------

int 4个字节byte 32位有符号 有一位表示符号 其余31位表示实际的数字 2^31^ 20多亿 这是正数的范围 但我们还需要表示负数和0 如果是无符号数unsigned 那就是从0到 2^32^

char 1个字节 short 2个字节 long 4个字节 long long 8个字节 但是到底几个字节都取决于编译器 我们可以调用`sizeof(long)` `sizeof(long long)`去查询 或者写`sizeof long`也行 这些数据类型也都可以变成unsigned

char可以表示数字 也可以表示字符 这不是说其他整数类型不能表示字符 实际上字符也只是一个数字 根据ASCII码对应 但是根据编程习惯 我们一般期待char是一个字符 而其他整数类型代表的就应该是数字 `char a=65` 用cout对a进行输出 我们会得到字母A `char a='A'` 也是会输出A 因为cout就是会把变量a看成是一个字符 如果是`short a=65` 就会cout输出数字65 `short a='A'` 还是会cout输出65 **数据类型之间唯一的区别 就是分配多少内存的区别，以及编译器是如何使用这些存储在该内存的值的**

float 4个字节 double 8个字节 `float virable=5.5` 你以为你定义了一个float 实际上你定义了一个double `float virable=5.5f` 这才是真的float 或者`float virable=5.5F`

bool true或者false 但是如果`bool virable=true` cout之后会输出数字1 因为实际上计算机不知道什么true还是flase 它只知道0和1 **0表示flase 任何不是0的数字都是1** 计算机只会处理数字 bool是1个字节 我们有巨大的1byte内存地址空间用来放1个bool值 我们不一定要确定是哪个bit被设置为1 只要这个byte里有东西 不为0 那它就是true 所以true有可能是1 但并不强迫我们设置为1 [关于在C++中 bool 非0为true 0为false的讨论](https://chocomintopia.github.io/1-Cherno-C++.html#mypoint_4)

但为什么bool不是1个bit 它确实是只用1bit 但当我们处理寻址内存时 我们没有办法寻址只有1个bit位的内容 我们只能访问字节 但你也可以在1byte内存里存储8个bool数 但仍然是分配1个字节的内存

可以用这些基本数据类型 写我们自己的自定义数据类型



### 5、函数

------

就是代码块 在class类里面 叫做方法 谈到函数时 我们明确地指不属于类里面的东西 你可以认为函数是有一个输入 也有一个输出 我们可以为函数提供一定的参数 当然也可以不提供参数 函数也可以不返回任何东西 就是void **函数是为了防止写重复代码的** 但也不用所有的东西都写成函数 会让程序变慢 每次我们调用函数时 编译器生成一个call指令 就会进入堆栈结构 把像参数这样的东西推进堆栈 还会需要一个返回地址 又会jump到二进制执行文件的不同位置 以便执行我们的函数指令 为了将push进去的结果返回 又要回到最初调用函数之前 就像在内存中跳跃来执行函数 跳跃和执行都需要时间 这些都是因为编译器决定保持我们的函数作为一个实际的函数 并不做内联inline



### 6、头文件

------

头文件的作用不仅仅是写一些声明 然后在多个cpp文件中使用 如果我们在一个文件中创建函数并且想在另一个文件中使用 但C++并不知道这个函数的存在 于是我们需要用一个公共的地方只存放声明（因为我们只能定义函数一次） 只有一个声明没有函数体 只是说这里有一个函数是存在的

比如我们实际上在某个cpp文件中使用了另一个cpp文件的函数 如果不声明 编译这个cpp文件时就会报错 所以我们要在这个cpp文件中添加那个函数的声明 这样才能通过编译 最后build的时候就能链接 正确找到那个函数 但是如果每一个cpp文件都要用这个函数 就要到处复制粘贴很麻烦 我们需要创建头文件 #include指令有复制和粘贴的功能 把声明都写到头文件里吧

`#pragma once` 创建.h头文件时为我们自动生成了这一句 所有以#开头的 都是预处理器命令或者预处理器指令 这意味着它将被优先处理 `#pragma once`意思是只包括这个文件一次 负责监督这个头文件 防止单个头文件多次被包含 并转换为单个翻译单元 这并不妨碍我们将头文件放到程序的多个位置 只是说放在一个翻译单元、一个cpp文件 原因是 如果我们不小心多次包含了一个文件并转换成一个翻译单元 我们会得到duplicate复制错误 因为我们会复制粘贴整个头文件多次 比如我们在头文件里写了一个结构体 如果我们放弃了pragma once 那么只要调用一次头文件就会复制一个结构体 最后我们会在同一个文件里有很多个相同名字的结构体 但你可能说我们并不会愚蠢到在同一个文件里多次使用同一个头文件 但是**头文件有嵌套问题 可能你在创造一个头文件时使用了另一个头文件的内容 会创造一链条的头文件**

如果不用pragma once 就用`#ifndef` 这是一种过去的方式 可能有人会用 你不要用
**现在就用pragma once**

```c++
//这是在头文件里写的
#ifndef _LOG_H //这是初始检查 检查是否有一个_LOG_H的符号被定义了 如果没有被定义 就继续 在编译中就包含下列代码 如果已经被定义了 下面这些直到#endif之前的东西就不会被包含进来 就被禁用了
#define _LOG_H

//一些头文件里的东西

#endif
```

`#include "Log.h"` `#include <iostream>` 有些用” “ 有些用< > 我们[暂时](https://chocomintopia.github.io/1-Cherno-C++.html#mypoint_12)不讨论

iostream也是一个文件 它只是没有扩展名 C++的设计者为了将C++标准库与C标准库进行区分才这样做 C标准库常常有.h扩展 但C++没有 

### 7、if语句

------

如果条件为真 我们跳到源代码的某一部分 如果值为假 我们跳到我们源代码的另一部分 我们这里说是源代码 但在实际运行的应用程序中是指机器指令 当我们开始一个应用程序时 整个应用程序及其所有模块加载到内存中 所有这些指令组成了我们的程序 现在都存储在内存中 当我们有了条件语句所产生的分支 我们是在告诉电脑跳到我们的这部分内存 在那里开始执行我们的指令 if语句和分支通常有比较大的开销 如果效率高做优化就避免写if语句

```c++
int x = 6;
bool comparisonResult = (x == 5);
if (comparisonResult == true)
	Log("Hello, World!");

std::cin.get();
```

`bool comparisonResult = (x == 5);` 这里的`==`是在C++标准库中被重载了 相当于写一个函数 接受两个整数参数 然后检查这两个整数的内存 实际上是在获取它们4个字节的内存 比较每个字节 为了让这两个整数是相等的 内存的每一位都必须相同 看它们是否相等 相等就返回true

`if (comparisonResult == true)`和`if (comparisonResult)` 是同一个意思

在debug中 右键某一行代码 - 转到反汇编 就可以查看它的汇编指令 不再需要在输出文件里修改成[.asm文件输出](https://chocomintopia.github.io/1-Cherno-C++.html#mypoint_1) 源码无法找到错误原因时 可以求助于调试CPU指令

```c++
int x = 6;
00007FF68B39240C  mov         dword ptr [x],6  
```

将值6 move到这个寄存器 就是变量x被设置为6

```c++
bool comparisonResult = (x == 5);
00007FF68B392413  cmp         dword ptr [x],5  
00007FF68B392417  jne         main+35h (07FF68B392425h)  
00007FF68B392419  mov         dword ptr [rbp+0F4h],1  
00007FF68B392423  jmp         main+3Fh (07FF68B39242Fh)  
00007FF68B392425  mov         dword ptr [rbp+0F4h],0  
00007FF68B39242F  movzx       eax,byte ptr [rbp+0F4h]  
00007FF68B392436  mov         byte ptr [comparisonResult],al  
```

把5加载到同一个寄存器 然后jne（就是jump not equal 而je就是jump equal jne和je都不是普通的跳转语句jmp 它是条件跳转语句） 现在就是比较5和6这两个值 如果不相等 not euqal 就跳转到内存地址07FF68B392425h 实际上就是`00007FF68B392425 mov dword ptr [rbp+0F4h],0 `这一行 现在我们已经知道5和6不相等 在debug时jump over 就会发现黄色箭头确实会到这一行 所以这一行就是将0移动到这个寄存器 这个寄存器是rbp这个实际的寄存器（rbp/ebp 基址寄存器 用于地址指定） 加上一定的偏移量 实际上我们知道它是把0移动到了bool值那里 bool值就被设置成了false 最后两行那个movzx mov 我们就不关心了

```c++
if (comparisonResult == true)
00007FF68B392439  movzx       eax,byte ptr [comparisonResult]  
00007FF68B39243D  cmp         eax,1  
00007FF68B392440  jne         main+5Fh (07FF68B39244Fh)  
```

将某些值加载到eax寄存器（通用寄存器）中 仍然是cmp然后jne comparisonResult不为true 不为1 not equal 就跳转07FF68B39244Fh 是`std::cin.get();`那一行 跳过了Log函数 如果这里equal了就是直接继续Log函数

但实际上我们[复习bool](https://chocomintopia.github.io/1-Cherno-C++.html#mypoint_3)又知道 true不一定为1 只要非0就是true 在这里为什么是eax里的值一定要与1比较呢？

1. 类型提升规则
   当bool参与比较或运算时 会隐式转换为int类型 true提升为1，false提升为0 则`comparisonResult == true`等价于`(int)comparisonResult == 1` 编译器直接生成与1比较的指令

2. 编译器对bool的合法性假设
   编译器假设程序遵循C++标准 所有bool变量只能存储0或1 若通过非法手段（如内存覆写）使bool值为其他非0数 属于未定义行为 编译器无需处理

3. 逻辑操作的结果规范化
   逻辑运算符（如`==`、`&&`）生成的bool值会被规范化为0或1

   ```c++
   int a = 5, b = 3;
   bool c = (a == b); // c = 0（false）
   bool d = (a || b); // d = 1（true）
   ```

   因此 直接比较1是安全的

4. 优化与效率
   直接比较eax是否为1（单条cmp指令）比检查非0（需两次操作 测试是否为0 然后取反）更高效 编译器在合法代码前提下选择最优路径

其实如果那句修改成`if (comparisonResult)` 就不会涉及eax与1的比较 会变成

```c++
if (comparisonResult)
00007FF6C0CD2439  movzx       eax,byte ptr [comparisonResult]  
00007FF6C0CD243D  test        eax,eax  
00007FF6C0CD243F  je          main+5Eh (07FF6C0CD244Eh)  
```

你不需要考虑它是不是true 是不是1 只需要考虑它是不是0
`test eax, eax`等效于`cmp eax, 0` 但 test指令更高效 test是按位与 cmp是做减法 如果为0 就je

当然我们知道debug模式下是不会做任何优化的 实际上仅就5和6比较那里 完全可以做常数折叠 编译器自己就能做到 不需要在程序运行的时候再做比较

[开O2优化](https://chocomintopia.github.io/1-Cherno-C++.html#mypoint_5)之后 发现debug模式下右键已经不能反汇编了 只能[.asm输出](https://chocomintopia.github.io/1-Cherno-C++.html#mypoint_1) 关于这个汇编文件

主函数中有一个条件判断 当x等于5时调用Log函数 但现在将x初始化为6 所以比较结果应该是false 不会执行Log调用 在未优化的反汇编中 确实进行了比较和跳转 而优化后的汇编代码中 这些步骤被省略了 直接调用了std::cin.get()

优化后的.asm文件中 main函数部分非常简短 只调用了__CheckForDebuggerJustMyCode 然后调用了cin.get() 没有条件判断和Log相关的代码 这说明编译器在优化过程中识别到条件永远不会满足 因此完全移除了相关的代码

未优化的反汇编代码中 可以看到x被赋值为6 然后进行比较 设置comparisonResult为false 跳过了Log调用 而开启O2后 编译器进行了常量传播和死代码消除 因为x是常量6 比较x==5的结果必然是false 所以整个if语句块都会被移除 包括Log调用 因此优化后的代码不再包含这些无效的代码路径 直接执行cin.get()并返回

在开启O2优化后 编译器通过以下关键优化步骤彻底移除了条件判断和Log调用：

1. 常量传播 (Constant Propagation)
   1. `int x = 6`被识别为编译期常量
   2. 所有使用`x`的地方直接替换为6
2. 死代码消除 (Dead Code Elimination)
   1. 由于`x == 5`被替换为`6 == 5`，编译器直接判定结果为`false`
   2. 整个if代码块被识别为不可达代码，包括：
      1. `bool comparisonResult`的初始化
      2. `if (comparisonResult == true)`的条件判断
      3. `Log("Hello, World!")`的调用
3. 函数调用优化
   - 未被调用的`Log`函数被完全移除（假设没有其他调用点）

优化后的等效C++代码：

```c++
#include <iostream>

int main()
{
    std::cin.get();  // 唯一保留的有效代码
    return 0;
}
```

这种优化属于编译器的最基础优化级别 现代编译器（包括MSVC）在O1/O2级别都会自动进行这类常量传播和死代码消除

`if (comparisonResult)` 这句话做的就是 看看comparisonResult是不是为0 如果不是0 就执行`if{ }`内部的语句 如果写`if(1)` 那么就永远执行内部的语句

其实我们根本不需要存储到变量comparisonResult里 直接写`if (x == 5)` 使用这个变量仅仅是想说明 那个条件实际上是bool类型

如果 if 语句里只有一行 就不需要写 { } 但是不要写在同一行 比如写成

```c++
if (x == 5)   Log("Hello World!");
```

debug到这一行的时候 会搞不清楚正在运行哪里

bool只是数值 而if语句只是对数值进行检查 所以我们还可以写`if (x)` 因为现在x是6 不是0 所以它还是会执行条件满足时的语句

这个技巧在指针中常常使用 如果我们想检验指针是否为空 null 就是0 可以把指针放到一个 if 语句的条件当中

```c++
const char* ptr = "Hello";
if (ptr)
    Log(ptr);
```

因为指针被设置了某个值 它不是null 所以我们成功把这个指针打印到了控制台
如果`const char* ptr = 0;`或者`const char* ptr = nullptr;` 就不会执行`Log(ptr);`
所以写`if (ptr != nullptr)`和`if (ptr)` 效果是一样的

else 和 else if

```c++
if (ptr)
    Log(ptr);
else
	Log("Ptr is null!");
```

```c++
else if ( )
{
	//
}

//实际上等效于
else
{
	if ( )
	{
		//
	}
}

//所以并没有真正的else if 只是将两个语句放在一行而已
//else if并不是C++的关键字 就只是先else 然后if
```

只有在前面的 if 失败后 才会触发 else 语句

我们可以尽量尝试不使用 if 语句或者类似的东西 也就是不用逻辑编程 不是去做一个比较然后通过分支语句来处理 这样做会很慢 要尽量使用数学计算代替

### 8、循环

------

游戏循环 只要玩家还没有决定退出游戏 就需要对游戏状态更新 渲染 让角色持续保持移动状态 持续做所有的事情 一帧接一帧地

```c++
for (int i = 0; i < 5; i++)
{
	Log("Hello World!");
}
```

先声明一个变量i 如果条件为真 就跳到 for 循环里 执行循环体内部的代码 当完成了循环体 到达结尾的 } 时 执行 i++ 然后继续检查`i < 5`条件是否为真 最后一步是 i=4 做完循环体 然后 i++ 这之后i为5 `i < 5`条件不再为真 不再进入循环体 跳出循环

for 循环的3段声明
第1段 开始for循环时 运行一次
第2段 bool类型 将在for循环一次结束之后 进行评估
第3段 看上去是要在for循环的最后被运行

但是 我们也可以改成这样 并没有改变程序的行为

```c++
int i = 0;
bool condition = true;
for ( ; condition; )
{
	Log("Hello World!");
	i++;
	if (!(i < 5))
		condition = false;
}
```

`for( ; true; ; )` 或者 `for( ; ; ; )` 这就是无限循环

```c++
int i = 0;
while (i < 5)
{
	Log("Hello World!");
	i++;
}
```

比如我们希望游戏持续循环 只要running变量为true即可一直循环 这种时刻就倾向于用while循环 因为条件是不变的 不需要在每次循环之后改变这个条件 也不需要刻意在循环之前声明这个条件变量 只需要将之前的变量或者函数调用之后的结果拿来用 实际上不需要更新或者初始化某些东西

但当我们处理确定长度的数组时 倾向于使用for循环 因为我们只需要循环某个确定的次数 与此同时 我们跟踪的那个偏移量/索引（比如 i） 可以用于处理数组中的元素

do-while 是无论条件是否满足 先执行循环体一次

### 9、控制流语句

------

continue 只能在循环中使用 表示进入这个循环的下一次迭代 如果还有下一次迭代的话 如果没有了 循环就会结束
break 只能在循环中使用 跳出循环 终止循环
return 可以使用在任何地方 直接退出函数

```c++
for (int i = 0; i < 5; i++)
{
    if ((i + 1) % 2 == 0)
        continue;
	Log("Hello World!");
    std::cout << i << std::endl;
}
//Hello World! 变成只在 i 为偶数时输出 i=0 i=2 i=4分别输出
```

```c++
for (int i = 0; i < 5; i++)
{
    if ((i + 1) % 2 == 0)
        break;
	Log("Hello World!");
    std::cout << i << std::endl;
}
//Hello World! 变成只在 i=0 时输出一次 就跳出循环
```

```c++
int main()
{
    for (int i = 0; i < 5; i++)
	{
        if ((i + 1) % 2 == 0)
            return 0;
        Log("Hello World!");
        std::cout << i << std::endl;
    }
    Log("-------");
}
//i=0时直接满足条件 return 不会输出任何东西就结束
//不仅仅是跳出for循环 所以甚至是下面的分割线也没有输出
```

### 10、指针

------

对计算机来说 内存就是一切 所有的程序都会被加载到内存中 而指针对于管理和操纵内存非常重要

**指针是一个数字 一个存储内存地址的数字** 内存在计算机里 就像一条线性的街 街上的每座房子都会有地址 这个地址就是1个字节的数据 显然我们需要一种方法来寻址 指针就是这些地址 这些地址告诉我们房子在哪里

**一个指针只是一个地址 它是一个保存内存地址的整数** 忘记所有的类型 类型只是一种为了更便利而产生的虚构 所有类型的指针都只是保存内存地址的整数

```c++
void* ptr = 0;
```

我们给这个指针的内存地址是0 也就是NULL nullptr 0不是一个有效的地址 我们不能从内存地址0中读取或写入

```c++
void* ptr = NULL;
```

把鼠标悬停在NULL上 就可以看到宏定义`#define NULL 0` NULL 是一个宏定义 通常用于表示空指针 其值为 0

```c++
int var = 8;
void* ptr = &var;
```

在一个已经存在的变量前面加上& 表示取这个变量的内存地址 我们取了变量var的地址 并把它赋值给一个新的变量ptr

| 名称 | 值                             | 类型  |
| ---- | ------------------------------ | ----- |
| &var | 0x000000dba079fba4{0x00000008} | int*  |
| ptr  | 0x000000dba079fba4             | void* |
| var  | 0x00000008                     | int   |

我们可以看到 ptr的值为0x000000dba079fba4
只不过是一个64位16进制的数字（2个16进制数字 可以表示8位2进制数字 是1个字节8bit 这里是16个16进制数字 是8字节 也就是64位2进制 “位”这个词语 仅指二进制位bit） 当然我们现在已经知道这个数字的含义就是地址 如果你不知道这一点 那它的值 就仅仅是个数字 我们的编译环境是debug x64 所以无论是哪种类型的指针 它的值都是一个64位的数字 当然针对于&var 因为var是一个int 所以编译器只允许ptr的类型是void*或者int* 我们可以把&var强制转换

```c++
double* ptr = (double*)&var;
```

你就发现ptr的值还是一个64位16进制数字
0x000000c58b6ff764 {-9.2559592117432085e+61} 表示一个内存地址0x000000c58b6ff764被解释为指向double类型的指针 解引用后得到的值-9.2559592117432085e+61是无意义的 因为ptr实际指向的是int类型变量var的内存 而不是double
代码中将 &var（类型是int*）强制转换为double*导致未定义行为 int和double的内存布局不同 直接转换会导致错误的解释

而变量var是一个32位16进制的数字 符合其作为int的身份 我们把ptr的值 拖拽到内存1窗口的地址栏 可以看到08 00 00 00 说明这个数字 确实是var的地址

```c++
int var = 8;
void* ptr = &var;
*ptr = 10; //会报错
```

`*ptr`是逆向引用指针 dereferencing the pointer 意思是这个指针所指的那个变量 这个地址上所在的那个变量 逆向引用也可以叫做解引用
但如果这个指针的类型是void 那在逆向引用的时候 我们就只知道一个地址 不知道这个变量的类型 就不知道这个变量是多少位多少字节要占多少内存 没办法读写 所以如果想使用逆向引用去对这个变量读取或写入 指针就必须记录变量的类型
本例中变量var是int 所以我们必须告诉编译器 指针ptr指向的变量是一个int 这样才可以对这个地址上的变量进行读写

```c++
int var = 8;
int* ptr = &var;
*ptr = 10;
```

这样我们就成功地将var的值修改为10

```c++
int var = 8;
```

我们像这样创建变量时 就是在栈中创建它

```c++
char* buffer = new char[8];
```

分配了8个字节的内存 并返回一个指向那块内存开始的指针 在内存窗口可以看到 buffer这个地址 确实开辟了8个字节的空间 现在是cd cd cd cd cd cd cd cd 是Visual Studio的调试填充值 表示**未初始化的堆内存** 如果你切换到release模式 可能不会看到这种调试填充值

**未初始化的栈内存** 是cc cc cc cc cc cc cc cc(只有在vs上是这样的，linux上则是垃圾值)

```c++
memset(buffer, 0, 8);
```

`void *__cdecl memset(void *_Dst, int _Val, size_t _Size) `它接收一个指针 这个指针将会是内存块开始的指针 取一个值为0 取一个大小8字节 就将8个字节填入0

如果做`memset(buffer, 'a', 8);` 查看内存1窗口就可以看到 buffer地址上是61 61 61 61 61 61 61 61

查看内存1窗口就可以看到 以buffer地址开始的8个字节里是61 61 61 61 61 61 61 61 确实是填入了’a’

也可以看到61 61 61 61 61 61 61 61后面有fd fd fd fd 其实在刚才那些cd之后也有fd 这是调试器添加的保护字节 用于检测堆缓冲区溢出 release模式下不会有

上面例子就是使用`new`关键字来申请堆内存 在结束之后也应该删除数据 因为使用了数组来分配堆内存 所以要用`delete[]`

```c++
detele[] buffer;
```

指针本身也是变量 也存储在内存中 所以我们可以做指向指针的指针 二级指针或者三级指针

```c++
char** ptr = &buffer;
```

| 名称    | 值                                        | 类型   |
| ------- | ----------------------------------------- | ------ |
| buffer  | 0x000002ac05d55070 “”                     | char*  |
| &buffer | 0x000000c1deeff728{0x000002ac05d55070 “”} | char** |
| ptr     | 0x000000c1deeff728{0x000002ac05d55070 “”} | char** |
| *ptr    | 0x000002ac05d55070 “”                     | char*  |

buffer本身就是一个指针 它的值是分配的那块堆内存的起点
&buffer就是指针的指针 它的值是buffer这个指针的地址
ptr=&buffer 它的值也是buffer这个指针的地址
*ptr 是逆向引用 是“buffer这个指针的地址”位置处的变量 也就是buffer这个指针 它的值就是buffer这个指针的值 也就是分配的那块堆内存的起点

0x000002ac05d55070 后面的`""`引号表示buffer这个指针指向的动态分配内存当前存储的是一个空字符串 因为我们前面使用的是`memset(buffer, 0, 8);` 都初始化为0了 如果都初始化为’a’ 就应该是`“aaaaaaaa ”` 8个a 后面还有空格 空格实际上是未定义的内存内容 而不是实际的空格字符 因为buffer 未添加字符串终止符 `memset(buffer, 'a', 8);` 将 buffer 的 8 个字节填充为 ‘a’ 但没有添加 \0（字符串终止符） 因此 buffer 被解释为一个未终止的字符串 读取时会超出分配的8字节范围 访问到未初始化的内存 未初始化的内存是动态分配的内存 可能包含随机值 例如空格或其他字符 这些值在输出时可能被解释为不可见字符或空格

### 11、关于数组名的实质

------

数组名确实能够表示首元素的地址，但是有两个例外
1.sizeof(数组名)，这里的数组名表示整个数组，计算的是整个数组的大小，单位是字节

2.&数组名，这里的数组名表示整个数组，取出的是整个数组的地址(从值的角度的来说是一样的，所以到底和数组首地址有什么区别)，

```c++
//假设首地址是从0开始的
int arr[] = [1,2,3,4,5,6,7,8,9]
printf("%p\n",arr);//0
printf("%p\n",arr+1);//4
printf("%p\n",&arr[0]);//0
printf("%p\n",&arr[0]+1);//4

printf("%p\n",&arr);//0
printf("%p\n",&arr+1);//37
```

3.关于字符数组

```c++
char* c = "hello"
char c[20] = "hello"
```

其中这个c指向的是字符h的地址，也就是字符串的首地址,"hello"存放在代码段里，代码段只能读不能写
下面这个指的是，在栈空间stack里面给c[20]分配了内存空间，再将代码段中的"hello"传给了c[20],所以既可以读，也可以写

### 12、关于一些指针与二维数组的问题

------



```c++
int B[2][3]
int (*P)[3] = B;//因为B是一个指向元素是三列数组的数组的指针
printf("%p",B)//返回的是一个指向一维数组的指针
printf("%p",*B)//下面这两个是一样的，返回的都是int* 指向的是第一个一维数组的第一个元素
printf("%p",B[0])
```

指针的类型，只有我们在解引用和进行指针运算的时候，才会有关系，如果我们仅仅只是打印的话，存在这个指针变量的值就是起始地址

`B[i][j] = *(B[i]+j) = *(*(B+i)+j)`
对于上述式子的解释

1. 第二个的B[i]是一个一维数组的数组名，返回的就是一个int* 类型的指针，所以可以进行指针运算，最终返回的就是第i个数组的第j个元素的地址，解引用就拿到了值
2. 第三个的B是一维数组的指针，返回的是一个int (*)[3]类型的指针，所以解引用之后会得到一个一维数组，一维数组名返回的就是首元素的地址

> 注意二维数组可以没有行，但是一定要有列，因为这关系着编译器如何使用和解引用二维数组

### 13、关于一些指针与多维数组的问题

------



```c++
int B[2][3]
int (*P)[3] = B;//因为B是一个指向元素是三列数组的数组的指针
printf("%p",B)//返回的是一个指向一维数组的指针
printf("%p",*B)//下面这两个是一样的，返回的都是int* 指向的是第一个一维数组的第一个元素
printf("%p",B[0])
```

`c[i][j][k] = *(c[i][j]+k) = *(*(c[i]+j)+k) = *(*(*(c+i)+j)+k)`
对于上述式子的解释

1. 对于第二个 c[i][j]是一个一维数组名，返回的是第一个首元素的指针int *，加上k之后就是这个一维数组的第k个元素，解引用之后拿到的就是元素了
2. 对于第三个式子c[i]是一个二维数组名，返回的就是第一个一维数组的指针int (*)[],加上j之后返回的就是第j个一维数组的地址，解引用之后返回的就是一个一维数组，然后一维数组的数组名表示的就是数组首元素的地址，加上k之后就是第k个元素的地址，再解引用就拿到了值
3. 对于最后一个式子，c是一个三维数组名，返回的是第一个二维数组的指针int (*)[][]，加上i之后返回的就是第i个二维数组的地址，经过解引用，拿到的就是一个二维数组，二维数组名返回的是第一个一维数组的指针 int (*)[],加上j之后返回的就是第j个一维数组的地址，解引用之后返回的就是一个一维数组，然后一维数组的数组名表示的就是数组首元素的地址，加上k之后就是第k个元素的地址，再解引用就拿到了值

> 注：关于多维数组作为参数传递给函数
>
> ```c++
> #include <stdio.h>
> int Func1(int A[])//想要一个一维数组作为参数，但是最终还会被解释器解释成int* A
> int Func2(int (*B)[2])//想要一个二维数组作为参数或者是int B[][2]
> int Func3(int (*C)[2][2])//想要一个三维赎罪作为参数int C[][2][2]，数组的第一个维度可以被省略
> int main(){
>  int c[3][2][2] = {{{2,5},{7,9}},{{3,4},{6,1}},{{0,8},{11,13}}}
>    
> }
> ```

### 14、指针与动态内存 栈与堆

------

对于C++的程序在内存中的结构，总共分为4个部分，一个是存放代码指令的区域，一个是静态区或者是全局区，一个是栈区，这三个区域的内存大小都是不变的，对于堆来说，内存是程序员可以自己进行分配和释放的，所以堆的大小是可以改变的，所以也叫做动态内存分配。

> 注意这里的堆和栈不是数据结构中的栈，栈区是数据结构中的栈的一种底层的具体的实现方式，对于堆来说则不同，数据结构中的堆是一种特殊的树形结构，通常是完全二叉树，主要用于优先队列，堆排序等问题，而程序运行时候的堆区，没有数据结构，只是一块无序的内存池，所以这两个是完全不同的概念

### 15、关于内存分配函数

------

`void* malloc(size_t num)`
对于malloc函数，分配内存之后是不会进行初始化的，内存中都是垃圾值
`void* calloc(int n,size)`
对于calloc函数，也是分配内存，但是会进行初始化，比如对于整型来说初始化成0，
`void* readlloc(void* ptr,size_t size)`
对于realloc函数来说，情况更加复杂，这个函数的功能是重新分配内存，其中的ptr代表的是原内存，size对应的是新内存分配的大小

1. 对于新内存大于原内存的情况下，创建一块新的内存将原先的值进行拷贝，如果之前的那块内存(相邻之间)还有连续内存可以使用，会直接扩展之前的那块内存
2. 如果新内存小于等于原内存，可能复用原内存，多余的内存会进行释放，如果新内存==0，等效于free，如果原内存==NULL，那么等效于调用malloc函数

`free(要释放的内存的首地址)`
任何分配了的动态内存在程序结束之前会一直存在，除非显示的释放他，对于free函数来说，虽然我们释放了这个内存，但是仍然可以得到这块内存的值，比如说我讲A的连续一块内存释放了之后，还是可以通过A[i]来调用他，这是使用指针的时候，一个危险的地方，如果你知道了一个地址，那么你就可以看到那个地址中存放的值，但是你应该只读写分配给你的内存，如果这个地址不是分配给你的，或者是已经被释放了，我们将无法得知这个读写的地址上会是什么，不知道它之前的行为是什么，这完全取决于我们的编译器和操作系统

**new、delete与上面的区别**

1. 构造与析构（最本质的区别）

这是 new 存在的最大意义。**malloc 管“内存”，new 管“对象”。**

- **malloc/free**：malloc 只负责去系统那里切一块指定大小的字节给你，**它不管这块内存里放什么，也不会调用构造函数**。free 只是把内存还给系统，**不会调用析构函数**。
- **new/delete**：new 分为三步：调用 operator new 分配内存（底层通常还是调用的 malloc）。**调用对象的构造函数**进行初始化。返回特定类型的指针。delete 分为两步：**调用对象的析构函数**（清理资源，比如关闭文件、断开连接）。调用 operator delete 释放内存。

```c++
class A {
public:
    A() { cout << "构造函数：我出生了" << endl; }
    ~A() { cout << "析构函数：我走了" << endl; }
};

// 使用 malloc/free
A* p1 = (A*)malloc(sizeof(A)); // 只分配了内存，A 的构造函数根本没跑！
free(p1);                      // 只是还了内存，A 的析构函数没跑，资源可能泄露！

// 使用 new/delete
A* p2 = new A();               // 分配内存 + 调用构造函数
delete p2;                     // 调用析构函数 + 释放内存
```

2. 类型安全与大小计算

- **malloc**：返回 void*，你必须强制类型转换。而且你需要手动用 sizeof(T) * n 计算字节数，容易算错。
- **new**：返回具体类型的指针（如 int*、A*），不需要转换。编译器自动计算大小。

```c++
// malloc: 必须自己算大小，必须强转
int* p = (int*)malloc(10 * sizeof(int));

// new: 编译器帮你算，类型自动匹配
int* p = new int[10];
```

3. 失败处理机制

- **malloc**：分配失败返回 NULL。必须用 if (p == NULL) 判断。
- **new**：分配失败**抛出异常** std::bad_alloc。不需要手动判空（除非你使用 new(std::nothrow)）。

```c++
try {
    int* p = new int[100000000000]; // 如果太大失败了，直接跳到 catch
} catch (const std::bad_alloc& e) {
    cout << "内存不够了" << endl;
}
```

4. 配对使用（切记！）

千万不能混用！

- malloc 必须配 free。
- new 必须配 delete。
- new[]（数组） 必须配 delete[]。

**为什么 delete[] 很重要？**
如果你 new A[10]，却用 delete p（没加 []），编译器可能只会调用**第一个**元素的析构函数，剩下9个对象的析构函数没调用，导致资源泄露。malloc 则不存在这个问题，因为它压根不管析构。

5. 扩容机制 (Realloc)

这是上面提到的 realloc。

- **C 语言**：有 realloc，可以尝试原地扩容，不行就搬家。
- **C++ 的 new**：**没有 renew 或 realloc 这种操作！**为什么？因为 C++ 对象很复杂（可能包含指针、引用、禁止拷贝等）。简单的内存拷贝（memcpy，realloc 的底层行为）会破坏对象的内部结构。**C++ 的解决方案**：使用 std::vector。Vector 的底层原理就是帮你管理 new、扩容、数据移动和 delete。

**关于悬空指针**

```c++
int* p = new int(10);
delete p; // 内存还给系统了

*p = 20; // ❌ 依然是未定义行为（Undefined Behavior）。
         // C++ 并不会自动把 p 置为 nullptr。
```

**建议**：无论是 C 还是 C++，释放内存后，为了安全，最好手动加上一句：

```c++
free(p);
p = NULL; // C

delete p;
p = nullptr; // C++
```



### 16、内存泄漏问题

------

内存泄露是由于内存分配使用不当导致的问题，我们动态申请了内存，但是即使是使用了完了之后也(从来都)不去释放他，看起来我们的应用程序只是占据了一些未使用的内存，所以我们先要搞清楚两个问题

1. 为什么我们把它叫做内存泄露？
2. 为什么有不正确的动态内存(堆)的使用引起？

比如说我们随便写一个游戏，使用malloc进行数组的分配，如果我们一直玩的话，并不释放内存，打开任务管理器，查看我们的运行的程序，发现内存一直在增长，就是因为堆区是可变的，但是申请的内存一直在闲置，所以内存泄露就是在堆上增长垃圾，是不当的使用动态内存或者内存的堆区在一段时间内持续增长

### 17、函数返回指针

------

从栈底向上传第一个变量或者是一个地址是可以的，但是向下传递是不行的，后来创建的栈帧，可能会覆盖原来的内存，或者是因为栈帧的销毁导致内存被释放，从而导致了逻辑错误，那什么场景下，我们会去选择使用函数返回一个指针，比如说在堆上有一个内存地址，或者是在全局区有一个变量，可以安全的返回他们的地址

### 18、函数指针

------

首先我们要搞明白的是函数的地址是什么？
我们所编写的程序(.cpp)叫做源代码，经过编译器编译之后，会形成一个能被机器识别的二进制的可执行文件(.exe)，exe文件中存放的就是程序的指令，在运行的时候，系统会给我们的程序分配一块内存，这块程序内存中的代码指令区会读取exe文件中的二进制指令，之后按照指令的顺序从上往下执行的，但是遇到函数就会进行跳转，，在内存中，一个函数就是一堆连续的内存(里面是指令)，函数的地址，我们把它称为函数的入口点，是函数的第一条指令的地址，机器语言中的函数调用基本上就是一条跳转指令，跳转到入口点,下面就是c语言中函数指针的用法

```c++
#include <stdio.h>
int Add(int a,int b){
  return a+b;
}
int main(){
  int c;
  int (*p)(int, int);
  p = &Add//只使用函数名也是返回首地址
  c = (*p)(2,3)
}
```

### 19、函数指针的使用场景

------

使用场景都围绕一个概念，就是函数指针可以被用来作为函数参数，一个函数的引用传递给另外一个函数的时候，这个函数被称为回调函数，下面举一个例子

```c++
#include <stdio.h>

int compare(int a, int b) {
    if (a > b) return 1;
    else return -1;
}

void BubbleSort(int* A, int length,int (*compare)(int,int)) {
    int i = 0, j = 0;
    for (i = 0; i < length - 1; i++) {
        for (j = 0; j < length - i-1; j++) {
            if (compare(A[j] ,A[j + 1])>0) {
                int temp = A[j];
                A[j] = A[j + 1];
                A[j + 1] = temp;
            }
        }
    }
}

int main() {
    int i, A[] = { 3,2,10,7,2,5 };
    int length = sizeof(A) / sizeof(A[0]);
    //通过函数指针传参的形式回调函数compare，通过打分的方式进行函数
    BubbleSort(A, 6,compare);
    for ( i = 0; i < length; i++)
    {
        printf("%d ", A[i]);
    }
}
```

首先我来解释一下，为什么不直接在比较的地方修改大于小于号来实现降序还是升序，上面这种使用函数指针的实现方式，首先它进行了解耦，也就是把排序的功能和比较大小的功能拆开了，完美的符合我们写程序的规范，高内聚，低耦合，其次，具有极高的灵活性和扩展性，灵活性体现在，现在我们的排序的函数已经变成了一个通用的函数，我们只需要传入比较规则或者说打分机制(这是我们可以自定义的)，扩展性指的是因为我们掌握了打分的规则，所以我们就可以进行比较复杂的数据类型的比较，比如说结构体。“打分”的形式（函数指针/回调函数）是一种强大而标准的设计模式。它将算法的“流程”与“决策”分离，使得代码更加抽象、通用和可维护。C语言标准库中的 qsort 函数就是这个思想的最佳实践。对于学习编程而言，理解并掌握这种模式比仅仅实现一个排序功能要重要得多。

### 20、引用

------

引用只是指针的语法糖 引用能做的所有事都可以被指针取代 但尽量去优先使用引用
引用必须要引用已经存在的变量 引用本身并不是新的变量 不占用内存 没有真正的存储空间

```c++
int a = 5;
int& ref = a;
ref = 2;
LOG(a); // #define LOG(x) std::cout << x << std::endl;
```

`int&` 这个&是变量声明的一部分 并不是取地址 现在我们只是为a创造了一个别名ref ref变量是不存在的 它只存在于我们的源代码里 现在我们对ref的任何操作 都是像对a一样

```c++
//整型变量递增函数（无效）
void Increment(int x)
{
    x++;
}
Increment(a);
```

发现a根本没有如我们期望的那样 值递增了1
实际上这个函数只是把a的值 复制给了它新创建的变量value 然后value增加了1
我们需要通过函数真正地修改这个变量

方法1：
用指针把变量a的内存地址传递过去

```c++
void Increment(int* x)
{
    (*x)++;
    //根据运算优先级 如果不加() 就是先算++ 对地址进行递增
    //而我们期待的是先对指针逆向引用 找到这个地址的那个变量的值 对这个值++
}
Increment(&a);
```

我们把a的地址 复制给了函数里的新的指针变量x 再对x逆向引用 就可以直接写入变量a

方法2：
用引用 就是把a复制给了函数里新的引用x x就只是a的别名

```c++
void Increment(int& x)
{
    x++;
}
Increment(a);
```

一旦声明了引用 就不能改变它引用的东西

```c++
int a = 5;
int b = 8;

int& ref = a;
ref = b;
//此时 a=8, b=8
```

并不是如我们所计划的那样 ref去变成引用b 而是a的值被赋予为b的值
所以在声明引用的时候 就要为它赋值 因为它必须引用一些东西 它不是真正的变量
如何真正地更改引用指向的值？结果还是要用指针

```c++
int* ref = &a;
ref = &b;
```

**引用的本质**

事实上，在编译器生成的汇编代码层面，**引用（Reference）通常就是通过指针（Pointer）实现的**。引用在底层就是一个“如果不初始化就无法编译、且一旦绑定就不能修改指向的常量指针（T* const）”。因此，它们在性能上几乎完全一样。那为什么我们要使用指针

1.安全性：非空保证（Non-null Guarantee）

这是引用最大的优势。

- **指针**：可以是 nullptr。在函数内部使用指针前，原则上都需要进行判空检查（if (ptr != nullptr)），否则可能导致段错误（Crash）。
- **引用**：必须要在初始化时绑定到一个合法的对象，且**不存在“空引用”**的概念（除非你故意制造未定义行为）。

```c++
// 使用指针：必须时刻警惕空指针
void process(MyClass* ptr) {
    if (ptr) { // 必须判空
        ptr->doSomething();
    }
}

// 使用引用：语义上保证了对象一定存在
void process(MyClass& ref) {
    ref.doSomething(); // 放心调用，不需要判空
}
```

2. 语义的稳定性：不可变绑定（Immutability of Binding）

- **指针**：可以被“重定向”（Re-seated）。上一行代码它指向变量A，下一行它可以指向变量B。这增加了代码的复杂度，维护者需要跟踪指针到底指向哪里。
- **引用**：**从一而终**。引用一旦初始化绑定了某个对象，它这辈子就只能代表那个对象，不能再改变指向。

```c++
int a = 10, b = 20;

int* p = &a;
p = &b; // 合法：指针现在指向b了，逻辑可能变复杂

int& r = a;
r = b;  // 注意！这不是让r指向b，而是把b的值赋值给a！
        // 引用本身的绑定关系永远不会变。
```

3. 语法糖与可读性（Syntactic Sugar）

引用让代码写起来像在操作普通变量，而不需要满屏的 * 和 ->。

- **指针**：(*ptr).method() 或 ptr->method()
- **引用**：ref.method()

特别是在**运算符重载**（Operator Overloading）中，引用是必须的。你肯定不希望看到这样的加法：

```c++
// 如果没有引用，重载+号可能得这样用：
Complex* c = add(&a, &b); 
// 或者是
Complex c = *a + *b; 

// 有了引用，C++才能支持这种自然的写法：
Complex c = a + b; // operator+(const Complex&, const Complex&)
```

注意上面的引用的形参又加了一个const,代表着指针指向不可改变，并且内容只读

所以引用不是为了让机器跑得更快，而是为了**写出Bug更少、更易读的代码**。

### 21、类 class/struct

------

**类并不会增添任何新的功能 可以用类搞定的事 不用类也一样搞得定 类只是语法糖**
面向对象编程 类只是对数据和功能组合在一起的一种方法 **有数据和处理这些数据的函数** 可以更好地维护混乱的变量和函数 对其分组

```c++
class Player
{
    int x, y;
    int speed;
};
```

这里是创建一个新的**变量类型** 这个类的名字必须是唯一的 注意结尾有`;`

```c++
Player player;
```

于是我们创建了类型为Player的变量player
player就叫作对象object或者实例instance 我们这里就是实例化了一个Player对象

`Player.x = 5;` 这会报错 成员`Player::x`不可访问
player不能访问在类Player中声明的私有成员

这是因为在创建类时 可以指定类中内容的可见性 **默认情况下都是private** 意味着只有类中的函数才能访问这些变量 但我们希望在main函数里使用这些变量 所以要改成

```c++
class Player
{
public:
    int x, y;
    int speed;
};
```

public意味着可以在类之外的任何地方访问这些变量 我们暂时不讨论可见性

现在我们希望让player移动 可以写一个单独的函数

```c++
void Move(Player& player, int xa, int ya)
{
    //xa ya是在x轴 y轴上Player移动的距离
    player.x += xa * player.speed;
    player.y += ya * player.speed;
}
```

`Player&` 要修改Player对象 所以要用引用传递

如果要调用这个函数 `Move(player, 1, -1);`

但实际上类可以包含函数 我们可以把move函数移动到类中 **类内的函数被称为方法**

```c++
class Player
{
public:
	int x, y;
	int speed;

	void Move(int xa, int ya)
    {
		x += xa * speed;
		y += ya * speed;
	}
};
```

不需要再用`Player& player`传入player对象 因为我们已经在Player对象中了 所有的x y speed 指的就是当前对象的变量

调用是 `player.Move(1, 0);`

类class和结构体struct 是只有一个关于可见度的区别 其它没有任何区别
class的成员 默认为private 除非声明public 声明`public:`之前的是private 之后的是public
struct的成员 默认为public

struct在C++中存在的唯一原因 是希望与C保持向后兼容性 因为C没有类 却有结构体

如果我想要所有成员都是public 但又不想写public这个字 应该使用结构体吗？可以 因为它们之间就只有这么一点区别 没有正确答案 只取决于编程风格

plain old data(POD) 一种**只表示变量的结构 不包含大量功能 倾向于使用struct** 这种分组只是为了让我们的代码更容易使用
比如数学上的向量类

```c++
struct Vec2
{
    float x, y;
    
    void Add(const Vec2& other)
    {
        x += other.x;
        y += other.y;
    }
};
```

无论用class还是struct 都是代表这2个浮点数的一种结构 不像之前的Player类一样 包含大量功能 **但不是说在这里不会添加方法 但添加的这个函数只用来处理这些变量 直到最后我们都只讨论这两个变量**

另外就是我们**不会倾向于在struct中使用继承**
如果要有一个完整的类层次结构 或者某种继承层次结构 倾向于使用类
继承是一种增加另一层次的复杂的东西 可**我希望我的结构体 是数据的结构**

**先在主函数中写需求 然后再回到类里写方法**

Log类

```c++
// 这不是一份好的代码 但是是简单的代码

#include <iostream>

class Log
{
public:
	const int LogLevelError = 0; // Error级别
	const int LogLevelWarning = 1; // Warning级别
	const int LogLevelInfo = 2; // Info级别
	// LogLevelXXX 只有XXX级别以上的日志会被打印出来

private:
	int m_LogLevel = LogLevelInfo;
	// 默认级别为Info 所有级别的日志都会被打印出来


public:
	void SetLevel(int level)
    {	// 设置日志级别
		m_LogLevel = level;
	}
	
	void Error(const char* message)
    {
		if (m_LogLevel >= LogLevelError)
			std::cout << "[ERROR]: " << message << std::endl;
	}
	void Warn(const char* message)
    {
		if (m_LogLevel >= LogLevelWarning)
			std::cout << "[WARNING]: " << message << std::endl;
	}
	void Info(const char* message)
    {
		if (m_LogLevel >= LogLevelInfo)
			std::cout << "[INFO]: " << message << std::endl;
	}
};


int main()
{
	Log log;
	log.SetLevel(log.LogLevelWarning);
	log.Warn("Hello World");
	log.Error("Hello World");
	log.Info("Hello World");
	std::cin.get();
}
//约定只打印Warning级别以上的信息 所以只输出
// [WARNING]: Hello World
// [ERROR]: Hello World
// 如果我们没有设置LogLevel 默认就是InfoLevel 全部打印出来
```

`const char*` 现在就是字符串的意思 暂时不讨论

**m_前缀 约定这是一个私有的类成员变量** 这样我们就可以区分在类中 哪些是成员变量 哪些是局部变量

可以看到 变量放在了一块 方法放在了另一块

`const char*` 现在就是字符串的意思 暂时不讨论

**m_前缀 约定这是一个私有的类成员变量** 这样我们就可以区分在类中 哪些是成员变量 哪些是局部变量

可以看到 变量放在了一块 方法放在了另一块

### 22、静态Static

------

#### **类或结构体外部的static**s

**声明的静态函数或静态变量 只会在它被声明的cpp文件中被看到**

`static int s_Variable = 5;` **s_前缀 约定这是一个静态变量** **这个变量只会在这个翻译单元内部链接** 它只对这个翻译单元可见 [前面讲链接的时候](https://chocomintopia.github.io/1-Cherno-C++.html#mypoint_6) 我们就提到过static 链接器不会在这个翻译单元的作用域之外 寻找那个符号定义

```c++
// Static.cpp
static int s_Variable = 5;
```

```c++
// Main.cpp
#include <iostream>

int s_Variable = 10;

int main()
{
    std::cout << s_Varibale << std::endl;
    std::cin.get();
}
```

`Static.cpp`的`s_Variable`不会参与链接 这个程序不会链接报错 最后会输出10

如果Static.cpp的`static`删掉 改成

```c++
// Static.cpp
int s_Variable = 5;
```

不能正常编译 会链接报错 可以使用

```c++
// Main.cpp
extern int s_Variable;
// 之前是int s_variable = 10;
```

标志这个变量为extern 意思是它会在外部翻译单元中寻找s_Variable变量 称为external linkage或external linking 现在这样的话 s_Variable就是5 但如果Static.cpp里是`static int s_Variable = 5;` **有点像在类中声明private变量** 其他所有翻译单元都看不到这个s_Variable变量 链接器在全局作用域下 看不到这个变量

函数的static用法在[前面讲链接的时候](https://chocomintopia.github.io/1-Cherno-C++.html#mypoint_6)已经提到 使用static就可以函数名重复

什么情况下你会在class中使用private 你就什么情况下使用static静态变量 **尽量减少全局变量** 如果没有设定为static 那么链接器就会跨编译单元进行链接 **尽量将函数和变量标记为静态 除非你真的需要它们跨翻译单元链接**

#### 类或结构体中的static

------

如果static在类或者结构体中 在类的所有实例中 **这个变量只存在一次 只有一个版本** 也就是说 你有一个类 你反复创建这个类的实例 假如你在某一个实例中修改了这个静态变量的值 那么在这个类的所有实例中 这个静态变量的值都会改变

```c++
#include <iostream>

struct Entity
{
	int x, y;
	//这里选用结构体是因为希望x y是public

	void Print() {
		std::cout << x << ", " << y << std::endl;
	}
};

int main()
{

	Entity e;
	e.x = 2;
	e.y = 3;

	Entity e1 = { 5, 8 };
	// 这是使用初始化器来实例化

	e.Print();
	e1.Print();

	std::cin.get();
}	
```

现在就只是会正常地输出2,3 5,8

结构体Entity里改成`static int x, y;` 再用`e.x` `e.y`去初始化

```c++
Entity e;
e.x = 2;
e.y = 3;

Entity e1;
e1.x = 5;
e1.y = 8;
```

报错 `error LNK2001: 无法解析的外部符号 "public: static int Entityx" (?x@Entity@@2HA) `是因为**静态成员变量需要在类外部进行定义和初始化**

可以在`struct Entity`后面 `int main()`前面写

```c++
int Entity::x;
int Entity::y;
```

先写作用域Entity 再写变量名x 可以不需要让它等于任何东西
现在它们就被定义了 链接器可以连接到合适的变量

我们再运行 在debug下 可以发现 我们刚刚执行完`e.x = 2;` 在e.x变成2的同时 e1.x也变成了2 哪怕我们还尚未执行到`e1.x=5;` 而在我们执行完`e1.x=5;`时 e1.x和e.x同时同步地变成了5 最后的输出结果就是 5,8 5,8

其实你可以看到 **e.x与e1.x的地址 是一样的 也就是说在所有实例中 x y都只有这么一个版本 所有实例指向的都是相同的x y 同一个地址**

所以使用e.x e1.x去使用x 是完全没有什么意义的 **可以直接使用Entity::x 恰好能表示它的唯一性** 仿佛我们是在名为Entity的namespace中创建了两个变量 实际上它们并不属于类 它们可以是private的也可以是public的 它们仍然是类的一部分 而不是namespace 但其实它们和在namespace中一样

```c++
Entity e;
Entity::x = 2;
Entity::y = 3;

Entity e1;
Entity::x = 5;
Entity::y = 8;
```

这才是它真正正确的样子 我们一直是在修改同一个变量

**类中的静态变量适用于希望在所有Entity类的实例中共享某个数据 或者将这个数据实际存储在Entity类中是有意义的 因为它与Entity有关** 为了组织良好的代码 最好是在这个类中创建一个静态变量 而不是将一些静态的或者全局的东西到处乱放

静态方法也是类似的 换成`static void print()` 那么`e.print();`就是`Entity::Print();` 但是**静态方法不能访问非静态变量** 所以如果要使用print方法 x y必须是静态变量

现在我们让x y不再是静态的 改成普通的`int x, y;` 也删掉`int Entity::x;` `int Entity::y;` 也就是e和e1分别有自己的x y 再运行就会报错 **因为静态方法没有类实例** 实际上你在类中写的每个非静态方法总是获得当前类的一个实例作为参数 通过隐藏参数发挥作用 这是类在幕后的工作方式 我们暂时不谈 所以静态方法得不到那个隐藏参数 静态方法与在类外部编写方法是相同的 就像你在类的外面写

```c++
static void Print()
{
    std::cout << x << ", " << y << std::endl;
}
```

它现在就完全不知道x y是什么 可以改成

```c++
static void Print(Entity e)
{
    std::cout << e.x << ", " << e.y << std::endl;
}
```

这个方法 是非静态类方法在编译时的真实样子

```c++
static void Print()
{
    std::cout << e.x << ", " << e.y << std::endl;
}
```

这个方法就是静态类方法使用非静态变量时的样子 所以报错 它不知道你是要访问哪个Entity的x y 每个实例的x y都是不一样的 你又没给它一个Entity的引用 即使对于静态方法调用时 你写着`e.Print();` 但实际上因为它是静态方法 等同于你写了`Entity::Print();` 所以它还是不知道要找哪个Entity的x y

#### 局部static

------

声明一个变量 需要考虑两个问题 也就是**变量的生存期和作用域**

生存期指 在它被删除之前 它会在我们的内存中存在多久
作用域指 我们可以访问变量的范围

**静态局部变量 生存期基本上相当于整个程序的生存期 但作用域只在这个函数内** 但其实它不一定非要在函数里 你可以在任何作用域里声明它 这里只是用函数举例 也可以是if语句之类的 所以函数作用域的static和类作用域的static没有太大区别 生存期基本是相同的 但是在类的作用域中 类中的任何东西都可以访问这个静态变量 但在函数作用域声明一个静态变量 它将是那个函数的局部变量 对类来说也是局部变量

```c++
void Function()
{
	static int i = 0;
}
```

意思是 当我第一次调用函数时 变量i将被初始化为0 然后所有对函数的后续调用 不会再反复创建新的变量

```c++
#include <iostream>

void Function()
{
	static int i = 0;
	i++;
}

int main()
{

	for (int j = 0; j < 10; j++)
    {
		Function();
	}
	std::cin.get();
}
```

在debug下看这个for循环 jump in这个Function函数时 发现黄色箭头每次都跳过`static int i = 0;`这一行 直接编程将要执行`i++;` 而且即使这次循环结束了 在下一次循环执行Function函数时 i还是在那个地址没有变 而且i并不会被重置为0 毕竟黄色箭头会跳过`static int i = 0;`这一行去执行 i实际上一直在累加 变量i的生存期很长 但是一定要jump in Function函数才能看得到i的变化 监视1窗口在一遍又一遍地仅仅jump over执行for循环时 是看不到i的变化的 你必须jump in 才能看到i的更新 这也就是i的作用域仅在函数内

如果Function函数内的i并不是static i会在每次执行Function函数时 都被重置为0 i是在栈上创建的 函数作用域结束时 就会被销毁

实际上`static int i = 0;`写在函数内和写在函数外作为全局静态变量 使用起来效果是一样的 都是会一直累加 但是**写在函数内就可以增加不可见性** 变得不是大家都能使用

单例类 Singleton 只有一个实例的类

```c++
#include <iostream>

class Singleton
{
private:
	static Singleton* s_Instance; // 那个单例实例的指针
public:
	static Singleton& Get()
    {	// 获取那个单例实例 返回的是引用
		return *s_Instance;
	}

	void Hello() {}; // 总之是做什么事情的一个方法
};

Singleton* Singleton::s_Instance = nullptr; // 初始化单例实例的指针为nullptr

int main()
{

	Singleton::Get().Hello(); // 单例实例调用了Hello方法

	std::cin.get();
}
```

上面这个是类的静态
如果使用局部静态 main函数不变 class Singleton会变成下面这样 功能是完全一样的

```c++
class Singleton
{
public:
	static Singleton& Get()
    {
		static Singleton instance;
		return instance;
	}

	void Hello() {};
};
```

如果仅仅是`Singleton instance;` 没有static 因为Get()返回的是引用 而不是值 instance会在作用域结束之后销毁 就算返回了一个地址 那也是临时的
然而如果是static 生存期就很长了 每次我们调用Get()的时候 都会创建一个单例实例 然后返回这个已经存在的单例实例 这个单例实例将长时间存在 但是对于多个实例的类就没办法写这样的Get()创建 因为static就只能创建并维护这一个实例

不一定是非要Singleton 比如写一个静态初始化函数来创建所有对象 那就可以使用静态Get()方法

```c++
#include <iostream>

class Singleton
{
private:
    static Singleton* s_Instance; // 静态指针

public:
    // 【新增】专门的初始化函数，负责 new 对象
    static void Init() 
    {
        if (s_Instance == nullptr) {
            s_Instance = new Singleton();
        }
    }

    // Get 只负责拿，不负责创建（假设调用 Get 之前一定已经 Init 过了）
    static Singleton& Get()
    {
        // 如果这里不检查 s_Instance 是否为空，就必须保证外部先调用了 Init()
        return *s_Instance;
    }

    void Hello() { std::cout << "Hello!" << std::endl; };
};

Singleton* Singleton::s_Instance = nullptr;

int main()
{
    // 1. 在程序最开始，显式调用初始化函数
    // 这就是那段话说的“在程序的某处调用一个静态初始化函数来创建对象”
    Singleton::Init(); 

    // 2. 在其他地方，就可以放心地使用 Get() 了
    Singleton::Get().Hello();

    std::cin.get();
    return 0;
}
```

为什么这样写，这样写的原因是什么

**把“创建对象”和“获取对象”分开处理。**

这在**游戏引擎**或**大型系统**中非常常见，原因如下：

1. **控制初始化顺序**：
   如果有 SystemA, SystemB, SystemC 三个单例。如果都在 Get() 里自动创建，你很难控制谁先谁后（比如 SystemB 的构造函数里调用了 SystemA::Get()，这时候 SystemA 初始化了吗？）。如果用**显式初始化**，你可以在 main 里写死顺序：

   ```c++
   SystemA::Init(); // 必须先初始化 A
   SystemB::Init(); // B 依赖 A，所以后初始化
   SystemC::Init();
   ```

2. **避免运行时卡顿**：
   如果 Get() 包含复杂的创建逻辑（比如加载大文件），你不希望在游戏进行到一半突然调用 Get() 导致卡顿。你希望在游戏启动时的 Loading 界面统一把这些 Init() 跑完。

   

总结一下，三种情况下static变量的生存期和变量的作用域

1. 类/结构体**外**（全局/命名空间作用域）

即写在 .cpp 文件顶层，不在任何函数或类内部。

```c++
// file.cpp
static int g_Var = 10;      // 静态全局变量
static void g_Func() {}     // 静态全局函数
```

**生存期**：**静态生存期 (Static Storage Duration)**。从程序启动（或动态初始化时）开始，直到程序结束（main函数返回后）才销毁。

**作用域**：**文件作用域 (Internal Linkage)**。**关键点**：它们**只在当前源文件（编译单元）内可见**。其他 .cpp 文件即使使用 extern 也无法访问它们。这通常用于隐藏实现细节，避免与其他文件的同名全局变量冲突。

2. 类/结构体**内**（静态成员）

即在 class 或 struct 定义内部声明。

```c++
class MyClass {
public:
    static int s_Var;       // 静态成员变量
    static void s_Method(); // 静态成员方法
};
```

**生存期**：**静态生存期**。**变量**：不属于某个具体的对象实例，而是属于整个类。它在程序运行期间一直存在，无论是否创建了该类的对象。**方法**：代码段常驻内存，与普通函数类似。

**作用域**：**类作用域 (Class Scope)**。受 public/private/protected 权限控制。可以通过 类名::变量名 或 对象.变量名 访问。**关键点**：（1） **所有对象共享**同一份静态变量。（2） 静态方法**没有 this 指针**，因此只能直接访问类的静态成员，不能直接访问非静态成员。

> **注意**：静态成员变量通常需要在类外进行定义（分配内存），例如 int MyClass::s_Var = 0;（C++17引入 inline static 后可以直接在类内初始化）。

------

3. 局部静态（函数/代码块内）

即在函数或 {} 块内部。

```c++
void myFunc() {
    static int loc_Var = 0; // 局部静态变量
    loc_Var++;
}
```

**生存期**：**静态生存期**。**关键点**：变量只在**第一次**执行到该定义语句时进行初始化，之后函数调 用结束**不销毁**，下次调用时**保留上一次的值**。直到程序结束才销毁。

**作用域**：**局部作用域 (Local Scope)**。只能在定义它的函数或代码块 {} 内部访问。虽然它在内存中一直存在，但在块外部看不见它。



### 23、枚举

------

其实就是数值的集合 是给一个值命名的一种方法 将一组数值集合作为类型 而不仅仅是用整型作为类型

```c++
#include <iostream>

enum Example
{
	A, B, C
};

int main()
{

	Example value = B; // 赋值必须是A B C中的一个

	if (value == 1)
    {	// 现在value等于B 就是1
		// Do something
	}

	std::cin.get();
}
```

此时默认的A是0 B是1 一个接一个地递增
也可以初始化它 比如`A = 0, B = 2, C = 6`
如果是从一个非0数开始 `A = 5, B, C` 那么默认就是B=6 C=7

枚举默认是32位int整型 但也可以指定类型 但必须是整型 不能是浮点数

```c++
enum Example : unsigned char
{	// 8位整型
	A = 5, B, C
};
```

枚举是给特定的值命名的一种方式 这样就不必在各种地方 处理各种整数

[Log类](https://chocomintopia.github.io/1-Cherno-C++.html#mypoint_8)的3个级别 只是整数1 2 3 可以修改成枚举

```c++
public:
    enum Level
    {
        LevelError = 0, LevelWarning, LevelInfo
    };
private:
	Level m_LogLevel = LevelInfo;

// 原本是
// public:
// 	const int LogLevelError = 0; // Error级别
// 	const int LogLevelWarning = 1; // Warning级别
// 	const int LogLevelInfo = 2; // Info级别
//
//private:
//	int m_LogLevel = LogLevelInfo;
```

倾向于显式地写成=0 虽然它默认就是=0 仅仅为了提高代码可读性
使用Level就可以把m_LogLevel限制在枚举的那几个数字中 本例中就只能是0 1 2 后面涉及到level的也都要改成Level类而不是int

在主函数里调用时 不再用`log.LogLevelError` 而是`Log::LevelError` 因为我们在Log这个类的命名空间中 有一个枚举数叫Error 枚举Level本身并不是一个命名空间 不是枚举类 暂时先不讲枚举类 所以Error Warning Info只存在于这个Log类中

枚举其实就是整数

### 24、构造函数

------



```c++
class Entity
{
public:
    float X, Y;
    
    void Print()
    {
        std::cout << X << ", " << Y << std::endl;
    }
};

int main()
{
    Entity e;
    e.Print();
    std::cin.get();
}
```

输出的是`-1.07374e+08, -1.07374e+08` 由于未初始化 X的值是未定义的随机值 在 Print 方法中访问了未初始化的X和Y 我们得到的是那个内存空间中原来的那些东西 暂时我们不讲类初始化

X是public的 如果在主函数里直接用`std::cout << X << std::endl;`输出 就会报错 未初始化局部变量

因此需要初始化

```c++
class Entity
{
public:
    float X, Y;
    
    void Init()
    {
        x = 0.0f;
        Y = 0.0f;
    }
    
    
    void Print()
    {
        std::cout << X << ", " << Y << std::endl;
    }
};

int main(){
    Entity e;
    e.Init(); // 在这里初始化
    e.Print();
    std::cin.get();
}
```

但这样很麻烦 每次实例化之后都要再接一句初始化 有点麻烦了 就需要构造函数

构造函数是每次构造一个对象时都会调用的方法 **实例化时被调用 如果不实例化 就不会运行** 没有返回类型 名称必须与类的名称相同 可以有参数 也可以是完全空白

```c++
class Entity
{
public:
    float X, Y;
    
    Entity()
    {
        X = 0.0f;
        Y = 0.0f;
    } // 不再需要init方法了
    
    void Print()
    {
        std::cout << X << ", " << Y << std::endl;
    }
};
```

现在再`Entity e;` 它默认就是有初始化的

如果不指定构造函数 它也有构造函数 也就是默认构造函数 也就是

```c++
Entity(){
}
```

什么都不会做 C++并不会把int float自动初始化为0 必须手动初始化

在类里可以写很多构造函数 当然参数需要是不一样的 这叫**函数重载 即有相同的函数/方法名 但有不同参数的不同函数版本**

```c++
Entity(float x, float y)
{
    X = x;
    Y = y;
}
```

现在可以用参数实例化并初始化了 `Entity e(10.0f, 5.0f)`

如果使用new关键字来实例化（堆内存） 它也会调用构造函数

如果只希望别人用静态的方法 不能实例化

```c++
class Log{
private:
    Log() = delete; // 构造函数被删除了
public:
	static void Write()
    {
        
    }
}
```

我只想让别人这样用我的Log类 `Log::Write();` 不希望别人实例化

### 25、析构函数

------

和构造函数很相似 是在销毁对象时被调用
构造函数是设置变量 或者做任何所需的初始化
析构函数是卸载变量等东西 并清理使用过的内存

析构函数也适用于栈和堆分配的对象
如果用new分配一个对象 调用delete 析构函数会被调用
如果是栈对象 作用域结束时 栈对象将被删除 这时 析构函数也会被调用

```c++
class Entity
{
public:
    float X, Y;
    
    Entity()
    {
        X = 0.0f;
        Y = 0.0f;
        std::cout << "Created Entity!" << std::endl;
    }
    
    ~Entity()
    {
        std::cout << "Destoryed Entity!" << std::endl;
    }
    
    void Print()
    {
        std::cout << X << ", " << Y << std::endl;
    }
};

int main(){
    Entity e; // 这是栈分配
    e.Print();
    std::cin.get();
}

```

析构函数前面有`~`

这个例子中`float X, Y;` 我们在为这两个浮点变量申请内存时 完全没有考虑之后怎么清除内存 暂时不讨论内存分配

只有主函数退出时 析构函数才会被调用 所以也看不到析构函数打印的那句话 都放到函数里

```c++
class Entity
{
    // 和上面的一样 不再复制
}

void Function()
{
    Entity e;
    e.Print();
}

int main(){
    Function();
    std::cin.get();
}
```

因为`Entity e;`是在栈上创建的 所以在Function作用域结束之后就销毁 即在`std::cin.get();`未执行时 就已经输出了`Destoryed Entity!`

在函数也可以放断点 调用到这里的时候就会暂停

为什么要使用析构函数？
如果已经在堆上手动分配了任何类型的内存 那么需要手动清理
如果在Entity类使用中或者构造中分配了内存 需要析构函数来删除内存 因为当析构函数调用时 Entity实例对象就消失了

也可以手动调用析构函数 但是很少这样做 `e.~Entity();`
对于本例 调用析构函数其实也就只是打印 并没有释放什么资源 内存的释放其实是随着栈内存的作用域结束 自动释放的

### 26、继承

------

相互关联的类的层级结构 有一个包含公共功能的基类 防止代码重复 然后从基类或者父类派生一些类

比如游戏中 每一个实体都有自己的位置

```c++
class Entity
{
public:
    float X, Y;
    
    void Move(float xa, float ya)
    {
        X += xa;
        Y += ya;
    }
};

class Player : public Entity
{
public:
    const char* Name;
    
    void PrintName()
    {
        std::cout << Name << std::endl;
    }
};
```

任何Entity类中不是私有的东西 都可以被Player类访问 在Player类里只需要写新的东西

暂时我们不讨论多态 多态的意思是 一个单一类型 但有多个类型 Player不仅是一个Player 也是一个Entity 所以我们可以在任何想要使用Entity的地方使用Player 可以把Player类的实例传给适用于Entity类作为参数的函数
也可以改变父类或者基类的行为 比如重写一个方法 用新的代码来代替父类方法运行

### 27、虚函数

------

 虚函数允许我们在子类中重写方法
B是A的子类 如果在A类中创建一个方法 标记为vitual 就可以在B类中重写这个方法

```c++
class Entity
{
public:
    std::string GetName() { return "Entity"; }
};

class Player : public Entity
{
private:
    std::string m_Name;
public:
    Player(const std::string& name)
        : m_Name(name) {}
    
    std::string GetName() { return m_Name; }
}

int main()
{
    Entity* e = new Entity();
    std::cout << e->GetName() << std::endl;
    
    Player* p = new Player("123");
    std::cout << p->GetName() << std::endl;
    
    Entity* entity = p;
    std::cout << entity->GetName() << std::endl;
    
    std::cin.get();
}
```

1.`Player(const std::string& name) : m_Name(name) {}`
构造函数接受一个常量引用参数name
`:` 表示初始化列表开始
`m_Name(name)` 表示用参数name初始化成员变量m_Name
成员变量m_Name在对象创建时直接通过参数构造 而非先默认构造再赋值 避免默认构造 + 赋值的双重操作
等效于 先默认构造 再赋值

```c++
Player(const std::string& name)
 {
     m_Name = name;
 }
```

2.`Entity* e = new Entity();`
new Entity()会在堆上动态分配一个Entity对象 并返回其内存地址/指针 因此必须用指针变量Entity*来接收
堆上动态分配 `Entity* e = new Entity();`搭配`e->GetName();`
或者在栈上创建 `Entity e;` 搭配`e.GetName();`

3.`->`是指针访问成员的语法糖 `e->GetName()`等效于`(*e).GetName()`

4.`Entity* entity = p;`
p是Player类型的指针 把它赋值给了Entity类型的指针entity 是基类指针直接指向派生类对象 这是安全的 称为向上转型 Player对象的内存布局中包含Entity的基类部分

目前这段代码会输出

```c++
Entity
123
Entity //并不是123
```

`Entity* entity = p;` 为什么`entity->GetName()`会得到entity而不是123？
我们可以知道 entity和p都是指针 通过赋值 它们的地址一定是相同的 但是p能访问m_Name 而entity不能 entity的静态类型是Entity* 编译器只允许通过它访问Entity类的成员 比如GetName()无法直接访问Player类的m_Name

但我们希望C++能知道这个Entity实际上是Player 让它调用Player的GetName 因此需要虚函数 Dynamic Dispatch 动态联编 通过v表/虚函数表来实现编译 v表就是一个表 包含基类中所有虚函数的映射 这样就可以在运行时 将它们映射到正确的覆写/override函数 如果想覆写一个函数 就必须**将基类中的基函数标记为虚函数 在前面加上virtual 将覆写函数标记为关键字override** 只有虚函数才能被overrdie

```c++
class Entity
{
public:
    virtual std::string GetName() { return "Entity"; } // 修改了
};

class Player : public Entity
{
private:
    std::string m_Name;
public:
    Player(const std::string& name)
        : m_Name(name) {}
    
    std::string GetName() override { return m_Name; } // 修改了
}
```

虚函数是有运行成本的 首先需要额外的内存来存储v表 这样就可以分配到正确的函数 基类中要有一个成员指针 指向v表 以及每次调用虚函数时 要遍历这个表 来确定要映射到哪个函数

虚函数（virtual）是C++实现运行时多态的关键机制 它的核心原理是

- 虚表（vtable）：每个包含虚函数的类都有一个虚表 本质是一个函数指针数组 存储该类所有虚函数的实际地址
- 虚表指针（vptr）：每个对象内部隐含一个指针（vptr） 指向其所属类的虚表

在运行时 通过对象的vptr找到虚表 再通过虚表索引调用正确的函数实现

内存布局：

- Entity对象：

  ```c++
  | vptr (指向 Entity 的虚表) | Entity 其他成员... |
  ```

- Player对象：

  ```
  | vptr (指向 Player 的虚表) | Entity 基类成员... | Player 成员（如 m_Name）... |
  ```

虚表内容：

- Entity的虚表：

  ```c++
  [0] Entity::GetName 的地址
  ```

- Player的虚表：

  ```c++
  [0] Player::GetName 的地址  // 覆盖了基类的函数地址
  ```

当执行`entity->GetName()`时：

1. 获取vptr：通过entity指针找到对象的vptr（位于对象内存起始位置）
2. 查找虚表：通过vptr找到所属类的虚表 而entity也就是p的这个地址的起始位置 存储的其实仍然是Player的虚表 所以会调用到Player的GetName
3. 调用函数：从虚表中按索引（例如索引0对应GetName）取出函数地址 调用 `Player::GetName()`

在debug下 指针p和指针entity 的值是同一个地址 而且现在entity和p的值除了地址也都会显示m_Name=123 entity显示的类型是Entity*{Player} 在使用虚函数之前 entity是看不到m_Name的 类型也只是Entity*

内存窗口显示这个地址的内容是 64位小端序 vtpr要看前8字节 vtpr就是 `18 ec 77 35 f7 7f 00 00` 那就是地址0x7FF73577EC18

到这个地址去看 这就是Player类的虚表 前8个字节是`95 16 77 35 F7 7F 00 00` 那么函数Player::GetName地址就是0x7FF735771695 在内存窗口输入&Player::GetName又不是这个地址 最后两个字节不一样 是因为编译器在虚表中插入了调整this指针的代码片段 称为 Thunk 而非直接存储函数地址 这是MSVC实现多态时的常见行为 尤其在涉及虚函数覆盖或特定内存布局时

### 28、接口/纯虚函数 interface

纯虚函数允许我们在基类中定义一个没有实现的函数 然后强制子类去实现该函数

接口类只包含未实现的方法 所以基本上不能实例化

```c++
class Entity
{
public:
    virtual std::string GetName() = 0; //修改了
};

class Player : public Entity
{
private:
    std::string m_Name;
public:
    Player(const std::string& name)
        : m_Name(name) {}
    
    std::string GetName() override { return m_Name; }
}
```

仍然是virtual `=0` 意味着它必须在一个子类中实现

它还是一个类 是class 不是interface 是一个只有虚函数的类 C++没有Interface关键字 接口只是C++的类

现在这样不能实例化Entity 现在Player里实现了GetName 所以还可以实例化 如果没有实现 Player也不能实例化

```c++
class Printable
{
public:
	virtual std::string GetClassName() = 0;
};

class Entity : public Printable
{
// 要让Entity实现GetClassName()
public:
    virtual std::string GetName() { return "Entity"; }
    std::string GetClassName() override { return "Entity"; }
}

class Player : public Entity
{
private:
    std::string m_Name;
public:
    Player(const std::string& name)
        : m_Name(name) {}
    
    std::string GetName() override { return m_Name; }
    
    std::string GetClassName() override { return "Player"; }
}

void Print(Printable* obj)
{
    std::cout << obj->GetClassName() << std::endl;
}
```

只要某个Printable的子类没有覆写GetClassName() 这个类就无法实例化
Player已经是Entity的子类了 Entity里已经实现GetClassName() 这里不用再实现 如果不是子类的话 就要写成`class Player : public Entity, Printable`
Printable子类的每一个实例都同时也是一个Printable 所以都可以作为Print()的参数传进去

### 29、可见性

谁能看见它们 调用它们 可见性是对程序实际运行方式和程序性能都完全没有影响 可见性并不是你的CPU需要知道的东西 计算机是不知道的 只是为了方便组织代码

private protected public

private就是只有自己这个类内部可见 这个类的实例不可见 继承了这个类的子类也不可见 但是还有这个类的friend这种东西 也可以对private内容读取和写入 暂时不讨论

protected比private更可见 比public更不可见 这个类和它的子类可见 这个类的实例不可见

public 所有人都可以访问

可见性只是给人用的 在使用一个类的时候 只被允许使用public的东西 确保人们不会调用他们不应该调用的代码 因为有可能破坏其它东西 也可以给自己用 可以看到自己代码的设计意图 想要的访问和使用类的方式





















